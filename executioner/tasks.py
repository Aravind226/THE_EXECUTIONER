import docker
from celery import shared_task
import os

# Initialize the Docker client
# This looks for Docker running on your local machine

@shared_task
def execute_code(user_code):
    client = docker.from_env()
    try:
        # 1. Define the Container
        # We use client.containers.run() to create AND start it.
        container = client.containers.run(
            image="python:3.10-alpine",           # The OS to use
            command=["python", "-c", user_code],  # The command: python -c "print(1)"
            detach=True,                          # Run in background so we can control it
            mem_limit="128m",                     # SANDBOX: Limit RAM to 128MB
            network_disabled=True,                # SANDBOX: Block Internet access
            pids_limit=10,                        # SANDBOX: Prevent "fork bombs"
            cpu_period=100000,                    # SANDBOX: Limit CPU usage
            cpu_quota=50000,
        )

        # 2. Wait for result (with timeout)
        # If code runs longer than 5 seconds, we kill it.
        try:
            exit_data = container.wait(timeout=5)
            exit_code = exit_data['StatusCode']
        except Exception as e:
            # Timeout happened! Kill the container.
            container.kill()
            return {"status": "Timeout", "output": "Code took too long to run (>5s)."}

        # 3. Get Logs (Stdout)
        logs = container.logs().decode("utf-8")

        # 4. Cleanup (Crucial!)
        # Remove the container so we don't clog up the disk
        container.remove()

        if exit_code == 0:
            return {"status": "Success", "output": logs}
        else:
            return {"status": "Error", "output": logs}

    except Exception as e:
        return {"status": "System Error", "output": str(e)}