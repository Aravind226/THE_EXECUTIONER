# 💀 THE_EXECUTIONER

> **Code enters. Only the output leaves.**
> A high-performance, sandboxed remote code execution engine built for security and speed.

![System Status](https://img.shields.io/badge/System-ONLINE-green?style=for-the-badge)
![Security](https://img.shields.io/badge/Sandbox-ISOLATED-red?style=for-the-badge)
![Stack](https://img.shields.io/badge/Stack-Django%20|%20Celery%20|%20Docker-slate?style=for-the-badge)

**THE_EXECUTIONER** is a distributed system that allows users to run untrusted Python code securely. It solves the "blocking" problem of web servers by offloading execution to background workers and solves the "security" problem by isolating every script in a disposable Docker container.

<img width="1920" height="1080" alt="System Interface" src="https://github.com/user-attachments/assets/51e1a875-f587-4f49-8945-f31ae3ee049c" />

---

## ⚙️ System Architecture

The system uses an **Asynchronous Producer-Consumer** architecture to handle load without freezing the main API.

1.  **The Interface (React):** Submits code and polls for life-or-death status updates.
2.  **The Gatekeeper (Django):** Validates the payload and issues a "Death Warrant" (Task ID) into the Queue.
3.  **The Holding Cell (Redis):** Acts as the message broker, buffering tasks until a worker is free.
4.  **The Executioner (Celery):** The worker process that picks up tasks.
5.  **The Void (Docker):** A 128MB RAM, network-disabled Alpine Linux container where code runs, outputs data, and is immediately destroyed.

---

## 🛠️ Arsenal (Tech Stack)

### Frontend (Control Panel)
-   **React 18 + Vite:** High-performance UI.
-   **Tailwind CSS:** "Dark Mode" Cyberpunk aesthetic.
-   **PrismJS:** Syntax highlighting for the code editor.
-   **Axios:** For handling async API polling.

### Backend (The Engine)
-   **Django REST Framework:** The API Gateway.
-   **Celery:** Distributed Task Queue.
-   **Redis:** In-memory Data Store (Broker & Result Backend).
-   **Docker SDK:** Programmatic container management.

---

## ⚡ Installation Manual

Follow these steps to deploy the system locally.

### 0. Prerequisites
Before running the code, ensure your machine has the following "Heavy Machinery" installed:
* **Docker Desktop:** The engine needs this to spin up isolated containers.
    * *Linux Users:* Ensure your user has permission to use Docker (`sudo usermod -aG docker $USER`).
* **Redis:** This acts as the message broker.
* **Python 3.10+**
* **Node.js 16+**

### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR_USERNAME/the-executioner.git](https://github.com/YOUR_USERNAME/the-executioner.git)
cd the-executioner
