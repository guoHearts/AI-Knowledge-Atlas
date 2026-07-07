"""
Simple client for testing the Production Agent with Human Approval.
"""

import requests
import json
import argparse
from typing import Dict, Any, Optional


class AgentClient:
    """Client for interacting with the Production Agent system."""
    
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers.update({
            "X-API-Key": self.api_key,
            "Content-Type": "application/json"
        })
    
    def health_check(self) -> Dict[str, Any]:
        """Check server health."""
        response = self.session.get(f"{self.base_url}/health")
        response.raise_for_status()
        return response.json()
    
    def submit_task(self, 
                   task_type: str,
                   action: str, 
                   parameters: Dict[str, Any],
                   requires_approval: bool = False,
                   priority: str = "normal",
                   description: str = "") -> str:
        """Submit a new task."""
        payload = {
            "task_type": task_type,
            "action": action,
            "parameters": parameters,
            "requires_approval": requires_approval,
            "priority": priority,
            "description": description
        }
        
        response = self.session.post(
            f"{self.base_url}/agent/tasks",
            json=payload
        )
        
        if response.status_code != 200:
            raise Exception(f"Failed to submit task: {response.status_code} - {response.text}")
        
        result = response.json()
        return result["task_id"]
    
    def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """Get task status."""
        response = self.session.get(f"{self.base_url}/agent/tasks/{task_id}")
        
        if response.status_code == 404:
            raise Exception("Task not found")
        elif response.status_code != 200:
            raise Exception(f"Error getting task status: {response.status_code}")
        
        return response.json()
    
    def get_pending_approvals(self) -> list:
        """Get list of pending approval tasks."""
        response = self.session.get(f"{self.base_url}/approval/pending")
        response.raise_for_status()
        return response.json()
    
    def approve_task(self, task_id: str, approver: str) -> Dict[str, Any]:
        """Approve a task."""
        payload = {"approver": approver}
        
        response = self.session.post(
            f"{self.base_url}/agent/tasks/{task_id}/approve",
            json=payload
        )
        
        if response.status_code != 200:
            raise Exception(f"Failed to approve task: {response.status_code} - {response.text}")
        
        return response.json()
    
    def reject_task(self, task_id: str, approver: str, reason: str = "") -> Dict[str, Any]:
        """Reject a task."""
        payload = {"approver": approver, "reason": reason}
        
        response = self.session.post(
            f"{self.base_url}/agent/tasks/{task_id}/reject", 
            json=payload
        )
        
        if response.status_code != 200:
            raise Exception(f"Failed to reject task: {response.status_code} - {response.text}")
        
        return response.json()
    
    def close(self):
        """Close the client session."""
        self.session.close()


def main():
    parser = argparse.ArgumentParser(description="Production Agent Client")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # Health check command
    subparsers.add_parser("health", help="Check server health")
    
    # Submit task command
    submit_parser = subparsers.add_parser("submit-task", help="Submit a new task")
    submit_parser.add_argument("--type", required=True, help="Task type")
    submit_parser.add_argument("--action", required=True, help="Task action")
    submit_parser.add_argument("--params", help="Parameters as JSON string")
    submit_parser.add_argument("--approval", action="store_true", help="Require approval")
    submit_parser.add_argument("--priority", default="normal", help="Task priority")
    submit_parser.add_argument("--description", default="", help="Task description")
    
    # Task status command
    status_parser = subparsers.add_parser("status", help="Get task status")
    status_parser.add_argument("task_id", help="Task ID")
    
    # List approvals command
    subparsers.add_parser("approvals", help="List pending approvals")
    
    # Approve task command
    approve_parser = subparsers.add_parser("approve", help="Approve a task")
    approve_parser.add_argument("task_id", help="Task ID")
    approve_parser.add_argument("--approver", default="admin", help="Approver name")
    
    # Reject task command
    reject_parser = subparsers.add_parser("reject", help="Reject a task") 
    reject_parser.add_argument("task_id", help="Task ID")
    reject_parser.add_argument("--approver", default="admin", help="Approver name")
    reject_parser.add_argument("--reason", default="", help="Rejection reason")
    
    args = parser.parse_args()
    
    # Client configuration
    SERVER_URL = "http://localhost:8002"
    API_KEY = "your-agent-api-key"
    
    client = AgentClient(SERVER_URL, API_KEY)
    
    try:
        if args.command == "health":
            health = client.health_check()
            print(f"Server status: {health['status']}")
            
        elif args.command == "submit-task":
            params = json.loads(args.params) if args.params else {}
            task_id = client.submit_task(
                task_type=args.type,
                action=args.action,
                parameters=params,
                requires_approval=args.approval,
                priority=args.priority,
                description=args.description
            )
            print(f"Task submitted successfully: {task_id}")
            
        elif args.command == "status":
            status = client.get_task_status(args.task_id)
            print(f"Task status: {json.dumps(status, indent=2)}")
            
        elif args.command == "approvals":
            approvals = client.get_pending_approvals()
            if approvals:
                print(f"Pending approvals ({len(approvals)}):")
                for task in approvals:
                    print(f"  ID: {task['id']}, Type: {task['task_type']}, Priority: {task['priority']}")
            else:
                print("No pending approvals")
                
        elif args.command == "approve":
            result = client.approve_task(args.task_id, args.approver)
            print(f"Task approved: {result['task_id']}")
            
        elif args.command == "reject":
            result = client.reject_task(args.task_id, args.approver, args.reason)
            print(f"Task rejected: {result['task_id']}")
            
        else:
            parser.print_help()
            
    except Exception as e:
        print(f"Error: {e}")
    
    finally:
        client.close()


if __name__ == "__main__":
    main()