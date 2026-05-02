import firebase_admin
from firebase_admin import credentials, firestore

import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

import logging

logger = logging.getLogger("firebase_config")

# Initialize Firebase Admin SDK
def initialize_firebase():
    try:
        # Check if already initialized
        firebase_admin.get_app()
    except ValueError:
        # Not initialized yet
        try:
            # Check if environment variables are provided
            project_id = os.getenv("FIREBASE_PROJECT_ID")
            private_key = os.getenv("FIREBASE_PRIVATE_KEY")
            client_email = os.getenv("FIREBASE_CLIENT_EMAIL")
            
            if project_id and private_key and client_email:
                # Handle potential escaped newlines in the private key from .env file
                private_key = private_key.replace('\\n', '\n')
                
                cred_dict = {
                    "type": "service_account",
                    "project_id": project_id,
                    "private_key": private_key,
                    "client_email": client_email,
                    "token_uri": "https://oauth2.googleapis.com/token"
                }
                cred = credentials.Certificate(cred_dict)
            else:
                # Fallback to json file if env vars are missing
                cred = credentials.Certificate("serviceAccountKey.json")
                
            firebase_admin.initialize_app(cred)
        except Exception as e:
            logger.warning(f"Firebase initialization failed. Error: {e}")

def get_firestore_client():
    return firestore.client()