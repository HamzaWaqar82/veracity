"""Eval harness for FSMS RAG chatbot — LangSmith test suite."""

import argparse


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--api-url", required=True)
    args = parser.parse_args()
    print(f"Eval harness targeting {args.api_url}")
    print("TODO: implement 50-question evaluation")


if __name__ == "__main__":
    main()
