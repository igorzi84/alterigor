from dotenv import load_dotenv
from agents import Agent, Runner, trace
from pathlib import Path

load_dotenv(override=True)
CV_FILE = Path(__file__).resolve().parents[1] / "knowledge" / "cv.md"

#agent = Agent(name="aigor", instructions = "", model="gpt-5.6-luna")

#with trace("Test"):
#    result = Runner.run(agent, "Test")
def read_cv() -> str:
    with CV_FILE.open("r", encoding="utf-8") as file:
        return file.read()

            
def main():
    print(read_cv())

    
        