import sys
import subprocess
import os

# Hide Pygame prompt
os.environ['PYGAME_HIDE_SUPPORT_PROMPT'] = "hide"
import pygame
import time

def speak(text):
    temp_file = 'temp_speech.mp3'
    try:
        # Generate speech
        subprocess.run(['edge-tts', '--text', text, '--voice', 'en-GB-RyanNeural', '--write-media', temp_file], check=True)
        
        # Play silently
        pygame.mixer.init()
        pygame.mixer.music.load(temp_file)
        pygame.mixer.music.play()
        
        # Wait for audio to finish
        while pygame.mixer.music.get_busy():
            time.sleep(0.1)
            
        pygame.mixer.quit()
        # Optionally clean up the file
        if os.path.exists(temp_file):
            os.remove(temp_file)
    except Exception as e:
        print(f"Speech error: {e}")

if __name__ == "__main__":
    text = sys.argv[1] if len(sys.argv) > 1 else "Awaiting your authorization, Sir."
    speak(text)
