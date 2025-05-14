# YouTube-Video-QA-App-with-Retrieval-Augmented-Generation-RAG-
Overview
This project is a Retrieval-Augmented Generation (RAG) web application that allows users to ask questions about YouTube videos. The app retrieves the video’s transcript, indexes it, and uses a language model to answer questions based on the content of the transcript.

Features
Retrieve video transcripts: Fetches transcripts from YouTube videos (if available).

Text segmentation: Splits the transcript into manageable chunks for more efficient processing.

Question answering: You can ask questions related to the transcript, and the app provides answers based on the content.

Powerful Language Model: Uses a state-of-the-art language model to generate answers from the video transcript.

Technologies Used
FastAPI: Used to build the backend web server and create an API for the application.

LangChain: Facilitates integration with various language models and tools.

FAISS: A library to store and search through the indexed transcript text.

Hugging Face: Utilizes embeddings to index the transcript and create a searchable vector space.

YouTube Transcript API: Fetches video transcripts for videos on YouTube.

Together.ai: Provides the powerful language model for question answering.

Requirements
Python 3.x

fastapi

uvicorn

langchain

FAISS

requests

youtube-transcript-api

tiktoken

python-dotenv

A valid Together.ai API key.

