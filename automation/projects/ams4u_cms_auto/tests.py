
import os
import importlib.util
import traceback
import glob

def run_dispatcher(driver, job):
    """
    Main dispatcher for AMS4U project.
    Routes execution to specific case files based on job details.
    """
    filter_val = job.get('testFilter')
    print(f"[AMS4U] Dispatcher invoked with filter: {filter_val}")
    
    current_dir = os.path.dirname(__file__)
    cases_dir = os.path.join(current_dir, "cases")
    
    # helper to run a single file
    def run_file(filename, func_name_hint=None):
        full_path = os.path.join(cases_dir, filename)
        if not os.path.exists(full_path):
             return {
                "testName": "Dispatcher",
                "status": "FAIL",
                "message": f"Case file '{filename}' not found."
            }

        try:
            spec = importlib.util.spec_from_file_location(f"cases.{filename.replace('.py','')}", full_path)
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            
            # Find entry function
            func = None
            if func_name_hint and hasattr(module, func_name_hint):
                func = getattr(module, func_name_hint)
            elif hasattr(module, "run"):
                 func = module.run
            else:
                # Fallback
                for name, obj in vars(module).items():
                    if callable(obj) and (name.endswith("_case") or name.startswith("run_")):
                        func = obj
                        break
            
            if not func:
                return {
                    "testName": f"Case {filename}",
                    "status": "FAIL",
                    "message": f"No valid entry function found in {filename}"
                }
                
            print(f"[AMS4U] Running {func.__name__} from {filename}")
            
            import inspect
            sig = inspect.signature(func)
            if len(sig.parameters) >= 2:
                 return func(driver, job)
            else:
                 return func(driver)
                 
        except Exception as e:
            return {
                "testName": f"Error in {filename}",
                "status": "FAIL",
                "message": f"{e}\n{traceback.format_exc()}"
            }

    # 1. Dispatch Logic
    if not filter_val:
        # EXECUTE ALL CASES
        print("[AMS4U] No filter provided. Executing ALL cases in cases/ directory...")
        case_files = glob.glob(os.path.join(cases_dir, "case_*.py"))
        results = []
        
        # Note: 'local_runner.py' expects a single result dict if we return one.
        # But if we run multiple tests, we might want to return a summary or handle it differently.
        # However, local_runner currently only supports one return value per 'run_job' call if the function returns.
        # Wait! 'local_runner.py' calls 'test_func(DRIVER_INSTANCE)'.
        # If 'run_dispatcher' is the ONLY test function in 'tests.py' (which it effectively is due to filtering logic),
        # then it runs once.
        # BUT 'local_runner' loop iterates over 'run_*' functions.
        # If I want to run multiple tests, I should probably return a list of results?
        # Checking local_runner: line 173: result = test_func(...) -> line 180: requests.post(..., json=result).
        # It expects a SINGLE result dict.
        
        # Issue: The current runner architecture expects a 1-to-1 mapping of TestFunction -> Result.
        # If Dispatcher runs multiple internal tests, it can only return ONE result to the backend unless it manually posts results.
        
        # Pivot: Manually post sub-results here?
        # Or return a "Combined" result.
        
        BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3000/api")
        import requests
        
        failures = []
        overall_status = "PASS"
        
        for case_path in case_files:
            filename = os.path.basename(case_path)
            print(f"-- Executing Case: {filename} --")
            res = run_file(filename)
            
            # Enrich and Upload Result immediately
            res['projectId'] = job.get('projectId')
            try:
                requests.post(f"{BACKEND_URL}/save-result", json=res)
            except:
                print("Failed to upload sub-result")
                
            if res['status'] != "PASS":
                failures.append(filename)
                overall_status = "FAIL"
                
        return {
            "testName": "Full Suite Execution",
            "status": overall_status,
            "message": f"Executed {len(case_files)} cases. Failures: {failures}" if failures else f"All {len(case_files)} cases passed.",
            "duration": 0 # TODO: sum durations
        }

    else:
        # EXECUTE SPECIFIC CASE
        target_case_file = None
        target_func_name = None
        
        if filter_val.startswith("/"):
            slug = filter_val.strip("/").replace("/", "_")
            target_case_file = f"case_{slug}.py"
            target_func_name = f"{slug}_case"
        else:
            target_case_file = f"case_{filter_val}.py"
            target_func_name = f"{filter_val}_case"
            
            if not os.path.exists(os.path.join(cases_dir, target_case_file)):
                 target_case_file = filter_val if filter_val.endswith(".py") else f"{filter_val}.py"
                 target_func_name = None

        return run_file(target_case_file, target_func_name)
