from test import get_agent_url
import threading

def worker():
    global session_result
    session_result = get_agent_url()


thread = threading.Thread(target=worker)
thread.start()
thread.join()

print("Session:", session_result)
