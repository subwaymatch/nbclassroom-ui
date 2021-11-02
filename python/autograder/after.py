# GRADER_ONLY
import os
from datetime import datetime
import pandas as pd
autograder_output_filename = f"{assignment_name}-autograder-results.csv"

netid = autograded_result["netid"]
assignment_name = autograded_result["assignment_name"]
student_score = autograded_result["student_score"]
total_available = autograded_result["total_available"]
graded_time = datetime.now().strftime("%Y-%m-%d %H:%M")
feedback = '''Assignment: {0}
NetID: {1}
Total Score: {2}/{3}

Grade Breakdown'''.format(assignment_name, netid, student_score, total_available)

for graded_part_name in autograded_result["order"]:
    part_info = autograded_result["breakdown"][graded_part_name]
    feedback += '''
--------------------------------
Component: {0}
Result: {1}
Score: {2}/{3}'''.format(graded_part_name, "Pass" if part_info["did_pass"] else "Fail", part_info["points"], part_info["available_points"])

    feedback += "" if part_info["did_pass"] else f"\nError Message: {part_info['message']}"

if is_autograder_env:
    df_agr_new = pd.DataFrame([{
        "netid": netid,
        "assignment_name": assignment_name,
        "student_score": student_score,
        "total_available": total_available,
        "graded_time": graded_time,
        "feedback": feedback
    }])
    
    if not os.path.exists(autograder_output_filename):
        df_agr = df_agr_new
    else:
        df_agr = pd.read_csv(autograder_output_filename)
        df_agr = df_agr.loc[~((df_agr["netid"] == netid) & (df_agr["assignment_name"] == assignment_name))]
        df_agr = pd.concat([df_agr, df_agr_new])
        
    df_agr.sort_values("graded_time").to_csv(autograder_output_filename, index=None)