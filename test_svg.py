# Let's create the exact SVG for the user's logo with the octagonal G, the entertainment icons pattern, and the orange left-pointing triangle
svg_content = '''<svg viewBox="0 0 512 512" width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Entertainment pattern clipped into the G -->
    <pattern id="entertainment-icons" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
      <!-- Gamepad 1 -->
      <path d="M 12 18 C 10 18 8 20 8 23 C 8 27 10 32 12 34 C 13 35 15 34 16 33 L 19 30 L 25 30 L 28 33 C 29 34 31 35 32 34 C 34 32 36 27 36 23 C 36 20 34 18 32 18 Z" fill="#121212"/>
      <rect x="12" y="23" width="6" height="2" fill="#ffffff"/>
      <rect x="14" y="21" width="2" height="6" fill="#ffffff"/>
      <circle cx="30" cy="22" r="1.5" fill="#ffffff"/>
      <circle cx="28" cy="25" r="1.5" fill="#ffffff"/>
      
      <!-- Music Note 1 -->
      <path d="M 68 12 L 68 25 A 3.5 3.5 0 1 1 65 22 L 65 14 L 75 12 L 75 22 A 3.5 3.5 0 1 1 72 19 L 72 10 Z" fill="#121212"/>
      
      <!-- Video / Screen 1 -->
      <rect x="80" y="32" width="14" height="10" rx="1.5" fill="#121212"/>
      <polygon points="85,35 85,39 89,37" fill="#ffffff"/>
      
      <!-- Single Music Note -->
      <path d="M 44 48 L 44 58 A 3 3 0 1 1 41 55.5 L 41 48 L 47 46.5 L 47 51 Z" fill="#121212"/>
      
      <!-- Gamepad 2 -->
      <path d="M 62 68 C 60 68 58 70 58 73 C 58 77 60 82 62 84 C 63 85 65 84 66 83 L 69 80 L 75 80 L 78 83 C 79 84 81 85 82 84 C 84 82 86 77 86 73 C 86 70 84 68 82 68 Z" fill="#121212"/>
      <rect x="62" y="73" width="6" height="2" fill="#ffffff"/>
      <rect x="64" y="71" width="2" height="6" fill="#ffffff"/>
      <circle cx="80" cy="72" r="1.5" fill="#ffffff"/>
      <circle cx="78" cy="75" r="1.5" fill="#ffffff"/>
      
      <!-- Video 2 -->
      <rect x="16" y="66" width="13" height="9" rx="1.5" fill="#121212"/>
      <polygon points="20,68.5 20,72.5 24,70.5" fill="#ffffff"/>
      
      <!-- Dice / Dots -->
      <rect x="36" y="82" width="8" height="8" rx="1" fill="#121212"/>
      <circle cx="40" cy="86" r="1" fill="#ffffff"/>

      <!-- Pair Notes 2 -->
      <path d="M 22 92 L 22 98 A 2 2 0 1 1 20 96 L 20 93 L 28 91 L 28 96 A 2 2 0 1 1 26 94 L 26 90 Z" fill="#121212"/>
      
      <!-- Headphone / Media icon -->
      <path d="M 86 86 C 84 86 82 88 82 91 L 82 95 C 82 96 83 97 84 97 L 85 97 L 85 91 L 84 91 C 84 89 85 88 86 88 C 87 88 88 89 88 91 L 87 91 L 87 97 L 88 97 C 89 97 90 96 90 95 L 90 91 C 90 88 88 86 86 86 Z" fill="#121212"/>
      
      <!-- Small stars/accents -->
      <circle cx="52" cy="26" r="1.2" fill="#121212"/>
      <circle cx="10" cy="50" r="1.2" fill="#121212"/>
      <circle cx="94" cy="60" r="1.2" fill="#121212"/>
      <circle cx="50" cy="94" r="1.2" fill="#121212"/>
    </pattern>

    <!-- Clip path for the octagonal G stroke -->
    <mask id="g-mask">
      <rect width="512" height="512" fill="black" />
      <path d="M 370 78 L 190 78 L 78 190 L 78 322 L 190 434 L 340 434 L 434 340 L 434 256 L 310 256" 
            fill="none" 
            stroke="white" 
            stroke-width="84" 
            stroke-linecap="square" 
            stroke-linejoin="miter" />
    </mask>
  </defs>

  <!-- G Body (Solid white background for the letter) -->
  <path d="M 370 78 L 190 78 L 78 190 L 78 322 L 190 434 L 340 434 L 434 340 L 434 256 L 310 256" 
        fill="none" 
        stroke="#ffffff" 
        stroke-width="84" 
        stroke-linecap="square" 
        stroke-linejoin="miter" />

  <!-- Pattern of Entertainment Icons overlaid on G -->
  <rect width="512" height="512" fill="url(#entertainment-icons)" mask="url(#g-mask)" />

  <!-- The Vibrant Orange Triangle pointing LEFT in the center -->
  <polygon points="340,214 340,298 248,256" fill="#ff6600" />
</svg>'''

with open('logo.svg', 'w') as f:
    f.write(svg_content)
with open('icon.svg', 'w') as f:
    f.write(svg_content)
print("logo.svg created")
