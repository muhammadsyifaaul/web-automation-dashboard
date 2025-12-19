
import sys
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
    
    # Add cases dir to sys.path to allow imports between cases (e.g. login_helper)
    if cases_dir not in sys.path:
        sys.path.append(cases_dir)
    
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
        print("--------------------------------------------------")
        print("[AMS4U] MODE: RUN ALL CASES (No Filter)")
        print("--------------------------------------------------")
        
        case_files = glob.glob(os.path.join(cases_dir, "case_*.py"))
        if not case_files:
             return {"testName": "Suite", "status": "FAIL", "message": "No case files found in cases/"}

        BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3000/api")
        import requests
        
        failures = []
        overall_status = "PASS"
        
        for case_path in case_files:
            filename = os.path.basename(case_path)
            print(f"[AMS4U] Found Case: {filename}")
            res = run_file(filename)
            
            # Enrich and Upload Result immediately for each case
            res['projectId'] = job.get('projectId')
            try:
                print(f"[AMS4U] Uploading result for {filename}...")
                requests.post(f"{BACKEND_URL}/save-result", json=res)
            except Exception as e:
                print(f"[AMS4U] Failed to upload sub-result: {e}")
                
            if res['status'] != "PASS":
                failures.append(filename)
                overall_status = "FAIL"
                
        return {
            "testName": "Full Suite Execution",
            "status": overall_status,
            "message": f"Executed {len(case_files)} cases. Failures: {failures}" if failures else f"All {len(case_files)} cases passed.",
            "duration": 0
        }

    else:
        # EXECUTE SPECIFIC CASE
        print("--------------------------------------------------")
        print(f"[AMS4U] MODE: RUN SINGLE CASE (Filter: {filter_val})")
        print("--------------------------------------------------")

        target_case_file = None
        target_func_name = None
        
        # Normalize filter (e.g., /login -> case_login.py)
        if filter_val.startswith("/"):
            slug = filter_val.strip("/").replace("/", "_")
            target_case_file = f"case_{slug}.py"
            # Optional: target_func_name = f"{slug}_case"
        else:
            # Maybe they passed "case_login" or "login"
            clean_name = filter_val.replace(".py", "")
            if clean_name.startswith("case_"):
                target_case_file = f"{clean_name}.py"
            else:
                target_case_file = f"case_{clean_name}.py"

        print(f"[AMS4U] Resolved target file: {target_case_file}")
        return run_file(target_case_file, target_func_name)
