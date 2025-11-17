/*
╔═══════════════════════════════════════════════════════════════════════════╗
║                          DYNAMIC MODAL GENERATION                         ║
╚═══════════════════════════════════════════════════════════════════════════╝
*/

// Helper function for color names
function getColorName(hexColor) {
    const colorMap = {
        '#000000': 'Black',
        '#FFFFFF': 'White',
        '#FFFF00': 'Yellow',
        '#FFD700': 'Yellow'
    };
    return colorMap[hexColor.toUpperCase()] || 'Top';
}

// Make getColorName globally accessible for training modal
window.getColorName = getColorName;

// Generate all modal HTML dynamically for lazy loading
function generateModalHTML() {
    const modalContainer = document.createElement('div');
    modalContainer.id = 'dynamicModals';
    
    modalContainer.innerHTML = `
        <div id="settingsModal" class="modal">
            <div class="modal-content" style="max-width: 400px; margin-top: 50px; height: 500px; display: flex; flex-direction: column;">
                <div class="modal-header" style="flex-shrink: 0;">
                    <span class="modal-title">Settings</span>
                    <button class="close-btn" onclick="closeSettingsModal()">&times;</button>
                </div>
                <div class="modal-body" style="overflow-y: auto; flex: 1;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                        <label for="hintToggle">Show Tracing Guides:</label>
                        <input type="checkbox" id="hintToggle" onchange="toggleHints(this.checked)">
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                        <label for="showPathsToggle">Show Shape Paths:</label>
                        <input type="checkbox" id="showPathsToggle" onchange="toggleShowPaths(this.checked)">
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                        <label for="dynamicParityToggle">Dynamically Decide Even/Odd:</label>
                        <input type="checkbox" id="dynamicParityToggle" onchange="toggleDynamicParity(this.checked)">
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                        <label for="priorityLearningToggle">Enable Priority Based Learning:</label>
                        <input type="checkbox" id="priorityLearningToggle" onchange="togglePriorityLearning(this.checked)">
                    </div>
                    <div style="margin-top: 20px;">
                        <button onclick="openColorSchemeModal()" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%; margin-bottom: 10px;">Color Scheme Settings</button>
                        <button onclick="openCaseNameModal()" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%; margin-bottom: 10px;">Case Name Settings</button>
                        <details style="margin-top: 10px; margin-bottom: 10px;">
                            <summary style="cursor: pointer; font-weight: 600; color: #333; user-select: none; padding: 8px 0; display: flex; align-items: center; gap: 8px; list-style: none;">
                                <span style="font-size: 0.9rem; transform: rotate(0deg); transition: transform 0.2s; display: inline-block; flex-shrink: 0;" class="arrow">▶</span>
                                <span>Extensions</span>
                            </summary>
                            <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 10px; padding-left: 0;">
                                <div style="display: flex; gap: 10px;">
                                    <button onclick="exportData()" style="flex: 1; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; font-weight: 500;">Export Data</button>
                                    <label style="flex: 1; padding: 8px 16px; background: #28a745; color: white; border-radius: 4px; cursor: pointer; text-align: center; font-size: 1rem; font-weight: 500; margin: 0; display: flex; align-items: center; justify-content: center;">
                                        Import Data
                                        <input type="file" id="importFile" accept=".json" style="display: none;" onchange="handleFileImport(this.files[0])">
                                    </label>
                                </div>
                                <button onclick="openSuggestModal()" style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Suggest Updates / Report Bugs</button>
                                <button onclick="openConfessionModal()" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Confession</button>
                            </div>
                        </details>
                        <button onclick="openHowToUseModal()" style="padding: 8px 16px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">How to Use This App</button>
                    </div>
                </div>
            </div>
        </div>

        <div id="caseNameModal" class="modal">
            <div class="modal-content" style="max-width: 800px; margin-top: 50px;">
                <div class="modal-header">
                    <span class="modal-title">Case Name Settings</span>
                    <button class="close-btn" onclick="closeCaseNameModal()">&times;</button>
                </div>
                <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
                    <div style="margin-bottom: 20px; padding: 15px; background: #f0f9ff; border-radius: 8px; border: 2px solid #007bff;">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                            <label for="shortLRToggle" style="font-weight: 600; color: #2d3748;">Show short version of Left/Right (L. /R. ):</label>
                            <input type="checkbox" id="shortLRToggle" onchange="toggleShortLR(this.checked)" style="transform: scale(1.3); cursor: pointer;">
                        </div>
                        <div style="border-top: 1px solid #cbd5e0; padding-top: 12px;">
                            <div style="font-weight: 600; color: #2d3748; margin-bottom: 8px;">Position of Left/Right prefix:</div>
                            <div style="display: flex; gap: 15px;">
                                <div style="display: flex; align-items: center; gap: 5px;">
                                    <input type="radio" id="lrPositionFront" name="lrPosition" value="front" onchange="setLRPosition('front')" checked style="cursor: pointer;">
                                    <label for="lrPositionFront" style="cursor: pointer;">On Front (Left 4-2)</label>
                                </div>
                                <div style="display: flex; align-items: center; gap: 5px;">
                                    <input type="radio" id="lrPositionBack" name="lrPosition" value="back" onchange="setLRPosition('back')" style="cursor: pointer;">
                                    <label for="lrPositionBack" style="cursor: pointer;">On Back (4-2 Left)</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="caseNameSettingsContainer" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;"></div>
                </div>
            </div>
        </div>

        <div id="colorSchemeModal" class="modal">
            <div class="modal-content" style="max-width: 500px; margin-top: 50px;">
                <div class="modal-header">
                    <span class="modal-title">Color Scheme Settings</span>
                    <button class="close-btn" onclick="closeColorSchemeModal()">&times;</button>
                </div>
                <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 8px;">Top Color:</label>
                        <div style="display: flex; gap: 10px;">
                            <button class="color-btn" data-face="top" data-color="#FFFF00" style="background: #FFFF00; width: 60px; height: 40px; border: 2px solid #ddd; border-radius: 4px; cursor: pointer;">Yellow</button>
                            <button class="color-btn" data-face="top" data-color="#000000" style="background: #000000; color: white; width: 60px; height: 40px; border: 2px solid #ddd; border-radius: 4px; cursor: pointer;">Black</button>
                            <button class="color-btn" data-face="top" data-color="#FFFFFF" style="background: #FFFFFF; width: 60px; height: 40px; border: 2px solid #ddd; border-radius: 4px; cursor: pointer;">White</button>
                        </div>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 8px;">Bottom Color:</label>
                        <div style="display: flex; gap: 10px;">
                            <button class="color-btn" data-face="bottom" data-color="#FFFF00" style="background: #FFFF00; width: 60px; height: 40px; border: 2px solid #ddd; border-radius: 4px; cursor: pointer;">Yellow</button>
                            <button class="color-btn" data-face="bottom" data-color="#000000" style="background: #000000; color: white; width: 60px; height: 40px; border: 2px solid #ddd; border-radius: 4px; cursor: pointer;">Black</button>
                            <button class="color-btn" data-face="bottom" data-color="#FFFFFF" style="background: #FFFFFF; width: 60px; height: 40px; border: 2px solid #ddd; border-radius: 4px; cursor: pointer;">White</button>
                        </div>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 8px;">Front Color:</label>
                        <div style="display: flex; gap: 10px;">
                            <button class="color-btn" data-face="front" data-color="#CC0000" style="background: #CC0000; width: 60px; height: 40px; border: 2px solid #ddd; border-radius: 4px; cursor: pointer;">Red</button>
                            <button class="color-btn" data-face="front" data-color="#00AA00" style="background: #00AA00; width: 60px; height: 40px; border: 2px solid #ddd; border-radius: 4px; cursor: pointer;">Green</button>
                            <button class="color-btn" data-face="front" data-color="#0066CC" style="background: #0066CC; width: 60px; height: 40px; border: 2px solid #ddd; border-radius: 4px; cursor: pointer;">Blue</button>
                            <button class="color-btn" data-face="front" data-color="#FF8C00" style="background: #FF8C00; width: 60px; height: 40px; border: 2px solid #ddd; border-radius: 4px; cursor: pointer;">Orange</button>
                        </div>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 8px;">Right Color:</label>
                        <div style="display: flex; gap: 10px;">
                            <button class="color-btn" data-face="right" data-color="#CC0000" style="background: #CC0000; width: 60px; height: 40px; border: 2px solid #ddd; border-radius: 4px; cursor: pointer;">Red</button>
                            <button class="color-btn" data-face="right" data-color="#00AA00" style="background: #00AA00; width: 60px; height: 40px; border: 2px solid #ddd; border-radius: 4px; cursor: pointer;">Green</button>
                            <button class="color-btn" data-face="right" data-color="#0066CC" style="background: #0066CC; width: 60px; height: 40px; border: 2px solid #ddd; border-radius: 4px; cursor: pointer;">Blue</button>
                            <button class="color-btn" data-face="right" data-color="#FF8C00" style="background: #FF8C00; width: 60px; height: 40px; border: 2px solid #ddd; border-radius: 4px; cursor: pointer;">Orange</button>
                        </div>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 8px;">Back Color:</label>
                        <div style="display: flex; gap: 10px;">
                            <button class="color-btn" data-face="back" data-color="#CC0000" style="background: #CC0000; width: 60px; height: 40px; border: 2px solid #ddd; border-radius: 4px; cursor: pointer;">Red</button>
                            <button class="color-btn" data-face="back" data-color="#00AA00" style="background: #00AA00; width: 60px; height: 40px; border: 2px solid #ddd; border-radius: 4px; cursor: pointer;">Green</button>
                            <button class="color-btn" data-face="back" data-color="#0066CC" style="background: #0066CC; width: 60px; height: 40px; border: 2px solid #ddd; border-radius: 4px; cursor: pointer;">Blue</button>
                            <button class="color-btn" data-face="back" data-color="#FF8C00" style="background: #FF8C00; width: 60px; height: 40px; border: 2px solid #ddd; border-radius: 4px; cursor: pointer;">Orange</button>
                        </div>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 8px;">Left Color:</label>
                        <div style="display: flex; gap: 10px;">
                            <button class="color-btn" data-face="left" data-color="#CC0000" style="background: #CC0000; width: 60px; height: 40px; border: 2px solid #ddd; border-radius: 4px; cursor: pointer;">Red</button>
                            <button class="color-btn" data-face="left" data-color="#00AA00" style="background: #00AA00; width: 60px; height: 40px; border: 2px solid #ddd; border-radius: 4px; cursor: pointer;">Green</button>
                            <button class="color-btn" data-face="left" data-color="#0066CC" style="background: #0066CC; width: 60px; height: 40px; border: 2px solid #ddd; border-radius: 4px; cursor: pointer;">Blue</button>
                            <button class="color-btn" data-face="left" data-color="#FF8C00" style="background: #FF8C00; width: 60px; height: 40px; border: 2px solid #ddd; border-radius: 4px; cursor: pointer;">Orange</button>
                        </div>
                    </div>
                    <div style="margin-bottom: 20px; margin-top: 20px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 8px;">Scramble Image Size: <span id="sizeValue">200</span>px</label>
                        <input type="range" id="imageSizeSlider" min="100" max="400" step="10" value="200" style="width: 100%; cursor: pointer;" oninput="updateImageSizePreview(this.value)">
                        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #666; margin-top: 5px;">
                            <span>Small (100px)</span>
                            <span>Large (400px)</span>
                        </div>
                    </div>
                    <div style="margin-top: 20px; text-align: center;">
                        <button onclick="saveColorScheme()" style="padding: 10px 30px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; font-weight: 600;">Save Color Scheme</button>
                        <button onclick="resetColorScheme()" style="padding: 10px 30px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; font-weight: 600; margin-left: 10px;">Reset to Default</button>
                    </div>
                </div>
            </div>
        </div>

        <div id="howToUseModal" class="modal">
          <div class="modal-content" style="max-width: 850px; margin-top: 50px; border-radius: 14px; overflow: hidden;">
            <div class="modal-header" style="background: linear-gradient(135deg, #007bff 0%, #17a2b8 100%); color: white; padding: 18px 25px;">
              <span class="modal-title" style="font-size: 1.6rem; font-weight: 700;">How to Use This App</span>
              <button class="close-btn" onclick="closeHowToUseModal()" style="color: white; font-size: 1.8rem;">&times;</button>
            </div>
            <div class="modal-body" style="max-height: 75vh; overflow-y: auto; padding: 25px 30px; background: #fdfdfd; color: #222; line-height: 1.75; font-family: 'Segoe UI', sans-serif;">
              <h2 style="margin-top: 0; color: #007bff; font-weight: 700;">Welcome to Square-1 Cubeshape Parity Trainer!</h2>
              <p style="font-size: 1.05rem; color: #555;">This short guide explains all the features and settings of the app so you can make the most out of it – from basic tracking to advanced parity analysis.</p>
              <div style="margin-top: 25px;">
                <h3 style="color: #2d3748; font-weight: 700;">🧩 Basic Features</h3>
                <ul style="padding-left: 20px; margin-top: 10px;">
                  <li>All <strong>90 cubeshapes</strong> are displayed in individual cards.</li>
                  <li>Click the checkmark on a card to change a case's state: <em>Unlearned → Learning → Learned</em>.</li>
                  <li>The top bar shows your learning progress, learned probability coverage, and your estimated "parity safety" percentage.</li>
                  <li>You can search cubeshapes by name or by their alternative names, and sort or filter them based on your needs.</li>
                  <li>Each case name is clickable. Clicking it opens a detailed window where you'll find setup moves, a note section where you can write hints for that case, and a training option that will generate random scramble for the case directly using <strong>csTimer's</strong> csp trainer. It has many more advanced features that are explained inside the advanced feature section.</li>
                  <li>Each case's note is directly visible on the homepage so that you can just look at the hint if you forget or need just a peek to remember a case's algorithm</li>
                </ul>
              </div>
              <hr style="border:none; border-top:2px solid #eee; margin:30px 0;">
              <div style="margin-top: 20px;">
                <h3 style="color: #2d3748; font-weight: 700;">Advanced Features</h3>
                <p>The <strong>Settings</strong> menu provides advanced tools to help you customize your learning experience and how parity information is displayed.</p>
                <div style="background:#f8fbff; border-left:5px solid #007bff; border-radius:8px; padding:15px 18px; margin-top:15px;">
                  <h4 style="margin:0; color:#007bff; font-size:1.05rem;">Show Tracing Guides</h4>
                  <p style="margin-top:5px;">This will show the tracing path I personally use; and if you don't know what you are doing yet, you can just mimic my tracing path for simplicity.</p>
                </div>
                <div style="background:#f8fbff; border-left:5px solid #007bff; border-radius:8px; padding:15px 18px; margin-top:15px;">
                  <h4 style="margin:0; color:#007bff; font-size:1.05rem;">Show Shape Paths</h4>
                  <p style="margin-top:5px;">Adds a section in the case details showing how the cubeshape changes as it is solved using an algorithm.</p>
                </div>
                <div style="background:#f8fbff; border-left:5px solid #007bff; border-radius:8px; padding:15px 18px; margin-top:15px;">
                  <h4 style="margin:0; color:#007bff; font-size:1.05rem;">Enable Priority-Based Learning</h4>
                  <p style="margin-top:5px;">Lets you organize cases into seven priority levels (from <em>Top</em> to <em>Meh</em>). You can then sort the grid by these levels to focus on what matters most first.</p>
                </div>
                <div style="background:#f8fbff; border-left:5px solid #007bff; border-radius:8px; padding:15px 18px; margin-top:15px;">
                  <h4 style="margin:0; color:#007bff; font-size:1.05rem;">Dynamically Decide Even/Odd</h4>
                  <p style="margin-top:5px;">Applies Kale's parity tracing logic directly to each algorithm to automatically decide if it solves an even or odd parity case. You can set your tracing orientation in <em>Parity Orientation Settings</em> and get your personalized csp algorithm app that will show exactly the alg you are to use</p>
                </div>
                <div style="background:#f8fbff; border-left:5px solid #007bff; border-radius:8px; padding:15px 18px; margin-top:15px;">
                  <h4 style="margin:0; color:#007bff; font-size:1.05rem;">Case Name Settings</h4>
                  <p style="margin-top:5px;">Allows you to rename cubeshapes, customize Left/Right prefixes, or swap them if you prefer mirrored naming conventions.</p>
                </div>
                <div style="background:#f8fbff; border-left:5px solid #007bff; border-radius:8px; padding:15px 18px; margin-top:15px;">
                  <h4 style="margin:0; color:#007bff; font-size:1.05rem;">Data Export and Import</h4>
                  <p style="margin-top:5px;">Since the app doesn't yet use an online database, your progress is stored locally. You can export it as a JSON file and import it later to restore your data.</p>
                </div>
                <div style="background:#f8fbff; border-left:5px solid #007bff; border-radius:8px; padding:15px 18px; margin-top:15px;">
                  <h4 style="margin:0; color:#007bff; font-size:1.05rem;">Parity Analysis Shortcut</h4>
                  <p style="margin-top:5px;">Clicking the underlined word <strong>"Parity"</strong> in the app's title opens Kale's Parity Tracer – a tool that analyzes parity directly from any scramble using your orientation settings.</p>
                </div>
              </div>
              <hr style="border:none; border-top:2px solid #eee; margin:35px 0;">
              <div style="margin-top:20px;">
                <h3 style="color:#2d3748; font-weight:700;">Setting Up Parity Orientation</h3>
                <p>In regular parity deduction, you might use two different starting points – one for corners and one for edges. In this app, you'll only set one starting point, which works for both. Here's how to do it correctly:</p>
                <ol style="padding-left:20px; margin-top:10px;">
                  <li>Choose a position where the <strong>first corner clockwise</strong> is your first traced corner.</li>
                  <li>Make sure the <strong>first edge clockwise</strong> is your first traced edge as well.</li>
                </ol>
                <p style="margin-top:12px; color:#444;">If your starting corner and edge are on two different sides of the cubeshape, or if you trace parity counterclockwise, then <strong>you are gay, you are queer, you have failed my app, you have failed humanity, and nobody loves you</strong>.</p>
                <hr><br>
                <p>Use the app in landscape mode for full experience.</p>
              </div>
            </div>
          </div>
        </div>

        <div id="suggestModal" class="modal">
          <div class="modal-content" style="max-width: 700px; margin-top: 60px; border-radius: 14px; overflow: hidden;">
            <div class="modal-header" style="background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 18px 25px;">
              <span class="modal-title" style="font-size: 1.5rem; font-weight: 700;">💡 Suggest Updates or Report Bugs</span>
              <button class="close-btn" onclick="closeSuggestModal()" style="color: white; font-size: 1.8rem;">&times;</button>
            </div>
            <div class="modal-body" style="max-height: 70vh; overflow-y: auto; background: #fdfdfd; padding: 25px 30px; color: #333; font-family: 'Segoe UI', sans-serif; line-height: 1.7;">
              <p style="font-size: 1.05rem;">If you think any new feature would make the app better, or if you found any bug, wrong or wrongly labeled algorithm, wrong cases showing up inside training, then let me know via email. (I am most probably gonna ignore it anyways)</p>
              <div style="background: #f8fff9; border-left: 5px solid #28a745; border-radius: 8px; padding: 15px 18px; margin-top: 15px;">
                <a href="mailto:abidashrafkhulna@gmail.com?subject=%5BSquare-1%20Parity%20App%5D%20Feedback%20or%20Bug%20Report&body=Hey%20Abid!%0D%0A%0D%0AHere's%20what%20I%20wanted%20to%20share:%0D%0A%0D%0A---%0D%0A(Please%20describe%20your%20suggestion%20or%20bug%20here)%0D%0A%0D%0AApp%20Version:%20v1.0%0D%0ADevice/Browser:%20" 
                  style="display: inline-block; margin-top: 10px; background: #28a745; color: white; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-weight: 600;">Email Me</a>
              </div>
              <p style="margin-top: 25px;">This app is <strong>open source</strong>. You can explore the code, or make your own tweaks and redistribute an even improved version of this app, I won't mind.</p>
              <p><a href="https://github.com/your-github-link" target="_blank" style="color: #007bff; text-decoration: none; font-weight: 600;">🌐 Visit the GitHub Repository</a></p>
            </div>
          </div>
        </div>

        <div id="confessionModal" class="modal">
          <div class="modal-content" style="max-width: 700px; margin-top: 60px; border-radius: 14px; overflow: hidden;">
            <div class="modal-header" style="background: linear-gradient(135deg, #6c757d, #343a40); color: white; padding: 18px 25px;">
              <span class="modal-title" style="font-size: 1.5rem; font-weight: 700;">A Small Confession</span>
              <button class="close-btn" onclick="closeConfessionModal()" style="color: white; font-size: 1.8rem;">&times;</button>
            </div>
            <div class="modal-body" style="max-height: 70vh; overflow-y: auto; background: #fdfdfd; padding: 25px 30px; color: #333; font-family: 'Segoe UI', sans-serif; line-height: 1.75;">
              <p><strong>Honest moment:</strong> this app started as a passion project inspired by <em>Hashtag Cuber's Cubeshape Parity</em> webpage.</p>
              <p>I used a few of her assets and algorithms (tweaked and fixed along the way), though I'm still unsure about the licensing terms. I couldn't find a way to contact <strong>Eva Kato</strong>, the creator – if anyone knows how to reach her, please do let me know!</p>
              <p>Originally, this was meant to be a private learning tool – a kind of "certificate" of my wild vibe-coding journey. But it turned out so useful that I decided to share it publicly, hoping it helps others too.</p>
              <div style="background: #fff6e6; border-left: 5px solid #ffc107; border-radius: 8px; padding: 15px 18px; margin-top: 15px;">
                <p style="margin: 0;">If Eva (or anyone who personally know her) prefers this to be taken down or modified, I'll happily replace all borrowed parts with original content immediately.</p>
              </div>
              <p style="margin-top: 20px;">The scramble generator was adapted from <strong>csTimer's</strong> open code. And fun fact – almost the entire app (except that part) was written entirely by AI large language models – mainly <em>Claude Sonnet 4.5</em> and a bit of chatGPT.</p>
              <p style="margin-top: 20px; font-size: 0.9rem; color: #555;">If you'd like to discuss or help make it more original, feel free to reach out:</p>
              <a href="mailto:abidashrafkhulna@gmail.com?subject=%5BSquare-1%20Parity%20App%5D%20Regarding%20Original%20Sources&body=Hey%20Abid!%0D%0AI'd%20like%20to%20discuss%20the%20app%20and%20original%20source%20content.%0D%0A" 
                style="display: inline-block; background: #6c757d; color: white; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-weight: 600; margin-top: 8px;">✉️ Contact Me</a>
            </div>
          </div>
        </div>
    `;
    
    document.body.appendChild(modalContainer);
    
    // Setup color button handlers after modals are created
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const face = this.getAttribute('data-face');
            const color = this.getAttribute('data-color');
            
            colorScheme[face + 'Color'] = color;
            
            const sameFaceButtons = document.querySelectorAll(`.color-btn[data-face="${face}"]`);
            sameFaceButtons.forEach(b => {
                if (b === this) {
                    b.style.border = '3px solid #007bff';
                    b.style.fontWeight = 'bold';
                } else {
                    b.style.border = '2px solid #ddd';
                    b.style.fontWeight = 'normal';
                }
            });
        });
    });
}

/*
╔════════════════════════════════════════════════════════════════════════════╗
║                             CASE DETAILS MODAL                             ║
╚════════════════════════════════════════════════════════════════════════════╝
*/

function openModal(name) {
    const item = data.find(d => d.name === name);
    if (!item) return;
    
    pushModalState('caseModal', closeModal);
    
    const prob = (item.probability / 3678 * 100).toFixed(3);
    const isSwapped = swappedCases.get(item.name) || false;
    const comment = comments.get(item.name) || '';
    
    const oddAlgos = isSwapped ? item.even : item.odd;
    const oddPars = isSwapped ? item.evenPar : item.oddPar;
    const evenAlgos = isSwapped ? item.odd : item.even;
    const evenPars = isSwapped ? item.oddPar : item.evenPar;
    
    const oddSetup = invertScramble(oddAlgos[0]);
    const evenSetup = invertScramble(evenAlgos[0]);
    
    // Determine parity labels dynamically if enabled
    let oddLabel = 'Odd';
    let evenLabel = 'Even';
    
    if (useDynamicParity) {
        try {
            if (oddAlgos[0] && oddAlgos[0] !== 'Done!' && typeof window.ParityTracerLibrary !== 'undefined') {
                const parityText = window.ParityTracerLibrary.createModal({
                    topColor: colorScheme.topColor,
                    topColorName: getColorName(colorScheme.topColor),
                    topColorShort: getColorName(colorScheme.topColor).charAt(0),
                    bottomColor: colorScheme.bottomColor,
                    bottomColorName: getColorName(colorScheme.bottomColor),
                    bottomColorShort: getColorName(colorScheme.bottomColor).charAt(0),
                    frontColor: colorScheme.frontColor,
                    rightColor: colorScheme.rightColor,
                    backColor: colorScheme.backColor,
                    leftColor: colorScheme.leftColor,
                    scrambleText: oddSetup,
                    returnOnlyValue: true
                });
                oddLabel = parityText.charAt(0).toUpperCase() + parityText.slice(1);
            }
            
            if (evenAlgos[0] && evenAlgos[0] !== 'Done!' && typeof window.ParityTracerLibrary !== 'undefined') {
                const parityText = window.ParityTracerLibrary.createModal({
                    topColor: colorScheme.topColor,
                    topColorName: getColorName(colorScheme.topColor),
                    topColorShort: getColorName(colorScheme.topColor).charAt(0),
                    bottomColor: colorScheme.bottomColor,
                    bottomColorName: getColorName(colorScheme.bottomColor),
                    bottomColorShort: getColorName(colorScheme.bottomColor).charAt(0),
                    frontColor: colorScheme.frontColor,
                    rightColor: colorScheme.rightColor,
                    backColor: colorScheme.backColor,
                    leftColor: colorScheme.leftColor,
                    scrambleText: evenSetup,
                    returnOnlyValue: true
                });
                evenLabel = parityText.charAt(0).toUpperCase() + parityText.slice(1);
            }
        } catch (error) {
            console.error('Dynamic parity error:', error);
        }
    }
    
    const displayName = getDisplayName(item.name); // Get customized name

    const modalHTML = `
        <div class="modal active" id="caseModal" onclick="if(event.target.id==='caseModal') closeModal()">
            <div class="modal-content" style="max-width: min(800px, 90vw);">
                <div class="modal-header">
                    <div class="modal-title">${displayName}</div>
                    <button class="close-btn" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
<div class="modal-images card-svg-container">
    <div style="width: 200px; height: 200px;">${item.top}</div>
    <div style="width: 200px; height: 200px;">${item.bottom}</div>
</div>
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div class="probability" style="font-size: 1.2rem;">${prob}%</div>
                        <div style="margin-top: 10px; text-align: center;">
                            <button onclick="swapAlgorithms('${item.name.replace(/'/g, "\\'")}');" style="padding: min(8px, 0.8vh) min(16px, 1.5vw); background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: min(1rem, 1.2vw); min-font-size: 0.85rem;">Swap Odd/Even</button>
                        </div>
                    </div>
                    <div class="modal-algo-section">
                        <span class="modal-algo-label">${oddLabel}:</span>
                        <div class="modal-subsection">
                            <span class="modal-subsection-label">Setup:</span>
                            <div class="modal-algo-line" style="cursor: pointer; background: #e8f5e9; padding: 8px; border-radius: 4px;" onclick="openNewParityAnalysis('${oddSetup.replace(/'/g, "\\'")}');" title="Click to analyze parity">${oddSetup}</div>
                        </div>
                        <div class="modal-subsection">
                            <span class="modal-subsection-label">Solution:</span>
                            ${oddAlgos.map((algo, idx) => {
                                const parCount = oddPars[idx];
                                let algoHTML = '';
                                if (parCount > 0) {
                                    const highlightEnd = countSlashes(algo, parCount);
                                    algoHTML = `<div class="modal-algo-line"><mark>${algo.substring(0, highlightEnd)}</mark>${algo.substring(highlightEnd)}</div>`;
                                } else {
                                    algoHTML = `<div class="modal-algo-line">${algo}</div>`;
                                }
                                
                                // Add path if enabled
                                if (showPaths && algo !== 'Done!') {
                                    try {
                                        if (typeof window.Square1ShapePathTracerLibraryWithSillyNames !== 'undefined') {
                                            const shapePath = window.Square1ShapePathTracerLibraryWithSillyNames.traceSolutionToSolutionShapePathPlease(algo);
                                            if (shapePath) {
                                                algoHTML += `<div style="margin-top: 8px; padding: 8px; background: #f0f9ff; border-radius: 4px; font-size: 0.85rem; color: #0369a1; font-family: monospace;">${shapePath}</div>`;
                                            }
                                        }
                                    } catch (error) {
                                        console.error('Shape path error:', error);
                                    }
                                }
                                
                                return algoHTML;
                            }).join('')}
                        </div>
                    </div>
                    <div class="modal-algo-section">
                        <span class="modal-algo-label">${evenLabel}:</span>
                        <div class="modal-subsection">
                            <span class="modal-subsection-label">Setup:</span>
                            <div class="modal-algo-line" style="cursor: pointer; background: #fff3e0; padding: 8px; border-radius: 4px;" onclick="openNewParityAnalysis('${evenSetup.replace(/'/g, "\\'")}');" title="Click to analyze parity">${evenSetup}</div>
                        </div>
                        <div class="modal-subsection">
                            <span class="modal-subsection-label">Solution:</span>
                            ${evenAlgos.map((algo, idx) => {
                                const parCount = evenPars[idx];
                                let algoHTML = '';
                                if (parCount > 0) {
                                    const highlightEnd = countSlashes(algo, parCount);
                                    algoHTML = `<div class="modal-algo-line"><mark>${algo.substring(0, highlightEnd)}</mark>${algo.substring(highlightEnd)}</div>`;
                                } else {
                                    algoHTML = `<div class="modal-algo-line">${algo}</div>`;
                                }
                                
                                // Add path if enabled
                                if (showPaths && algo !== 'Done!') {
                                    try {
                                        if (typeof window.Square1ShapePathTracerLibraryWithSillyNames !== 'undefined') {
                                            const shapePath = window.Square1ShapePathTracerLibraryWithSillyNames.traceSolutionToSolutionShapePathPlease(algo);
                                            if (shapePath) {
                                                algoHTML += `<div style="margin-top: 8px; padding: 8px; background: #f0f9ff; border-radius: 4px; font-size: 0.85rem; color: #0369a1; font-family: monospace;">${shapePath}</div>`;
                                            }
                                        }
                                    } catch (error) {
                                        console.error('Shape path error:', error);
                                    }
                                }
                                
                                return algoHTML;
                            }).join('')}
                        </div>
                    </div>
                    <div style="margin-top: 30px; text-align: center;">
                        <button onclick="event.stopPropagation(); closeModal(); openTrainingModal('${item.name.replace(/'/g, "\\'")}');" style="padding: min(12px, 1.2vh) min(30px, 2.5vw); background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: min(1.1rem, 1.3vw); font-weight: 600;">🔄 Train This Case</button>
                    </div>
                    <div style="margin-top: 20px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #333;">Notes:</label>
                        <textarea id="commentBox" style="width: 100%; min-height: 80px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-family: inherit; resize: vertical;">${comment}</textarea>
                        <div style="text-align: center;">
                            <button onclick="saveModalData('${item.name.replace(/'/g, "\\'")}');" style="margin-top: 10px; padding: 8px 20px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">Save</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.classList.add('modal-open');
    
    // Apply SVG scaling to modal after it's added to DOM
    setTimeout(() => {
        if (typeof updateSVGScaling === 'function') {
            updateSVGScaling();
        }
    }, 10);
}

function closeModal() {
    const modal = document.getElementById('caseModal');
    if (modal) {
        modal.remove();
        document.body.classList.remove('modal-open');
    }
}


function swapAlgorithms(name) {
    const currentSwap = swappedCases.get(name) || false;
    swappedCases.set(name, !currentSwap);
    closeModal();
    openModal(name);
}

function toggleCaseSwapLR(name) {
    const currentSwap = perCaseSwapLR.get(name) || false;
    perCaseSwapLR.set(name, !currentSwap);
    saveState();
    closeModal();
    openModal(name);
}

function saveModalData(name) {
    const commentBox = document.getElementById('commentBox');
    if (commentBox) {
        const commentText = commentBox.value.trim();
        if (commentText) {
            comments.set(name, commentText);
        } else {
            comments.delete(name);
        }
    }
    saveState();
    render();
    closeModal();
}



/*
╔════════════════════════════════════════════════════════════════════════════╗
║                               CASE NAME MODAL                              ║
╚════════════════════════════════════════════════════════════════════════════╝
*/

function openCaseNameModal() {
    const caseNameModal = document.getElementById('caseNameModal');
    if (!caseNameModal) return;
    
    caseNameModal.style.display = 'block';
    document.body.classList.add('modal-open');
    
    const shortLRToggle = document.getElementById('shortLRToggle');
    if (shortLRToggle) shortLRToggle.checked = useShortLR;
    
    const lrPositionFront = document.getElementById('lrPositionFront');
    if (lrPositionFront) lrPositionFront.checked = (lrPosition === 'front');
    
    const lrPositionBack = document.getElementById('lrPositionBack');
    if (lrPositionBack) lrPositionBack.checked = (lrPosition === 'back');
    populateCaseNameSettings();
    
    pushModalState('caseNameModal', closeCaseNameModal);
}

function closeCaseNameModal() {
    const caseNameModal = document.getElementById('caseNameModal');
    if (!caseNameModal) return;
    caseNameModal.style.display = 'none';
    document.body.classList.remove('modal-open');
}

function populateCaseNameSettings() {
    const container = document.getElementById('caseNameSettingsContainer');
    container.innerHTML = '';

    for (const shape of baseShapes) {
        const config = shapeAliases[shape];
        if (!config) continue;

        let defaultSetting = shape;
        if (shape === "Paired Edges") defaultSetting = "Pair";
        else if (shape === "Perpendicular Edges") defaultSetting = "L-Shape";
        else if (shape === "Parallel Edges") defaultSetting = "Line";
        const currentSetting = caseNameSettings.get(shape) || defaultSetting;
        const currentCustom = customCaseNames.get(shape) || '';
        const hasLR = shapesWithLR.includes(shape);
        const isSwapped = swapShapeLR.get(shape) || false;

        let radiosHTML = '';
        for (const option of config.options) {
            const id = `name-${shape}-${option}`.replace(/\s/g, '-');
            const checked = (currentSetting === option) ? 'checked' : '';
            radiosHTML += `
                <div style="display: flex; align-items: center; gap: 5px;">
                    <input type="radio" id="${id}" name="name-${shape}" value="${option}" ${checked} onclick="updateCaseNameSetting('${shape}', '${option}')">
                    <label for="${id}" style="cursor: pointer;">${option}</label>
                </div>
            `;
        }

        // Add the "Custom" radio
        const customId = `name-${shape}-Custom`;
        const customChecked = (currentSetting === 'Custom') ? 'checked' : '';
        const customInputId = `custom-name-${shape}`;
        radiosHTML += `
            <div style="display: flex; align-items: center; gap: 5px; flex-wrap: wrap;">
                <input type="radio" id="${customId}" name="name-${shape}" value="Custom" ${customChecked} onclick="updateCaseNameSetting('${shape}', 'Custom')">
                <label for="${customId}" style="cursor: pointer;">Custom:</label>
                <input type="text" id="${customInputId}" value="${currentCustom}" oninput="updateCustomCaseName('${shape}', this.value)" style="width: 100px; padding: 3px 5px; font-size: 0.9rem; border: 1px solid #ccc; border-radius: 3px;">
            </div>
        `;

        // Add L/R swap toggle if applicable
        let swapHTML = '';
        if (hasLR) {
            swapHTML = `
                <div style="display: flex; align-items: center; gap: 5px; margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
                    <input type="checkbox" id="swap-${shape}" ${isSwapped ? 'checked' : ''} onchange="toggleShapeSwapLR('${shape}', this.checked)" style="transform: scale(1.2); cursor: pointer;">
                    <label for="swap-${shape}" style="cursor: pointer; font-size: 0.9rem;">Swap Left/Right</label>
                </div>
            `;
        }

        const settingHTML = `
            <div style="border: 1px solid #eee; padding: 10px; border-radius: 5px; background: #fcfcfc;">
                <strong style="color: #007bff; margin-bottom: 8px; display: block; border-bottom: 1px solid #eee; padding-bottom: 5px;">${shape}</strong>
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    ${radiosHTML}
                    ${swapHTML}
                </div>
            </div>
        `;
        container.innerHTML += settingHTML;
    }
}

function updateCaseNameSetting(shape, value) {
    caseNameSettings.set(shape, value);
    saveState();
    render(); // Re-render cards with new names
}

function updateCustomCaseName(shape, value) {
    customCaseNames.set(shape, value.trim());
    // Also ensure the 'Custom' radio is selected if they type
    caseNameSettings.set(shape, 'Custom');
    const customRadio = document.getElementById(`name-${shape}-Custom`);
    if (customRadio) customRadio.checked = true;
    saveState();
    render(); // Re-render cards with new names
}

function toggleShapeSwapLR(shape, isChecked) {
    if (isChecked) {
        swapShapeLR.set(shape, true);
    } else {
        swapShapeLR.delete(shape);
    }
    saveState();
    render(); // Re-render cards with new names
}

function toggleShortLR(isChecked) {
    useShortLR = isChecked;
    saveState();
    render();
}

function setLRPosition(position) {
    lrPosition = position;
    saveState();
    render();
}

/*
╔════════════════════════════════════════════════════════════════════════════╗
║                               SETTINGS MODAL                               ║
╚════════════════════════════════════════════════════════════════════════════╝
*/

function openSettingsModal() {
    const settingsModal = document.getElementById('settingsModal');
    if (!settingsModal) return;
    document.body.classList.add('modal-open');
    settingsModal.style.display = 'block';
    
    const hintToggleCheckbox = document.getElementById('hintToggle');
    if (hintToggleCheckbox) hintToggleCheckbox.checked = showHints;
    
    const showPathsToggle = document.getElementById('showPathsToggle');
    if (showPathsToggle) showPathsToggle.checked = showPaths;
    
    const dynamicParityToggle = document.getElementById('dynamicParityToggle');
    if (dynamicParityToggle) dynamicParityToggle.checked = useDynamicParity;
    
    const priorityLearningToggle = document.getElementById('priorityLearningToggle');
    if (priorityLearningToggle) priorityLearningToggle.checked = enablePriorityLearning;
    
    pushModalState('settingsModal', closeSettingsModal);
}

function closeSettingsModal() {
    const settingsModal = document.getElementById('settingsModal');
    if (!settingsModal) return;
    settingsModal.style.display = 'none';
    document.body.classList.remove('modal-open');
}

function toggleHints(isChecked) {
    showHints = isChecked;
    localStorage.setItem('showHints', showHints);
    applyHintVisibility();
}

function applyHintVisibility() {
     if (showHints) {
        document.body.classList.remove('hide-hints');
    } else {
        document.body.classList.add('hide-hints');
    }
}

function toggleShowPaths(isChecked) {
    showPaths = isChecked;
    saveState();
    // No need to re-render cards, only affects modals
}

function toggleDynamicParity(isChecked) {
    useDynamicParity = isChecked;
    saveState();
    render(); // Re-render all cards with new parity labels
}

function togglePriorityLearning(isChecked) {
    enablePriorityLearning = isChecked;
    const priorityOption = document.getElementById('sortPriority');
    if (priorityOption) {
        priorityOption.style.display = isChecked ? 'block' : 'none';
    }
    // If disabling and currently on priority sort, switch to probability
    if (!isChecked && sortSelect.value === 'priority') {
        sortSelect.value = 'probability';
        filterAndSort();
    }
    saveState();
    render();
}

// Settings button click handler
document.addEventListener('DOMContentLoaded', () => {
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.onclick = openSettingsModal;
    }
});

// Color Scheme Modal Functions
function openColorSchemeModal() {
    const modal = document.getElementById('colorSchemeModal');
    modal.style.display = 'block';
    
    pushModalState('colorSchemeModal', closeColorSchemeModal);
    
    // Set image size slider value
    const slider = document.getElementById('imageSizeSlider');
    if (slider) {
        slider.value = scrambleImageSize;
        document.getElementById('sizeValue').textContent = scrambleImageSize;
    }
    
    // Highlight currently selected colors
    document.querySelectorAll('.color-btn').forEach(btn => {
        const face = btn.getAttribute('data-face');
        const color = btn.getAttribute('data-color');
        const currentColor = colorScheme[face + 'Color'];
        
        if (color === currentColor) {
            btn.style.border = '3px solid #007bff';
            btn.style.fontWeight = 'bold';
        } else {
            btn.style.border = '2px solid #ddd';
            btn.style.fontWeight = 'normal';
        }
    });
}

function closeColorSchemeModal() {
    const modal = document.getElementById('colorSchemeModal');
    modal.style.display = 'none';
}

function updateImageSizePreview(value) {
    document.getElementById('sizeValue').textContent = value;
    scrambleImageSize = parseInt(value);
}

function saveColorScheme() {
    saveState();
    closeColorSchemeModal();
    alert('Color scheme and image size saved! It will be applied to future training scrambles.');
}

function resetColorScheme() {
    colorScheme = {
        topColor: '#000000',
        bottomColor: '#FFFFFF',
        frontColor: '#CC0000',
        rightColor: '#00AA00',
        backColor: '#FF8C00',
        leftColor: '#0066CC',
        dividerColor: '#7a0000',
        circleColor: 'transparent'
    };
    scrambleImageSize = 200;
    saveState();
    openColorSchemeModal(); // Refresh the modal to show updated selection
    alert('Color scheme and image size reset to default!');
}

// Apply initial hint visibility state on load
applyHintVisibility();

// New parity analysis using ParityTracerLibrary
function openNewParityAnalysis(scramble) {
    if (typeof window.ParityTracerLibrary === 'undefined') {
        alert('Parity Tracer library not loaded');
        return;
    }
    
    window.ParityTracerLibrary.createModal({
        backgroundColor: '#ffffff',
        topColor: colorScheme.topColor,
        topColorName: getColorName(colorScheme.topColor),
        topColorShort: getColorName(colorScheme.topColor).charAt(0),
        bottomColor: colorScheme.bottomColor,
        bottomColorName: getColorName(colorScheme.bottomColor),
        bottomColorShort: getColorName(colorScheme.bottomColor).charAt(0),
        frontColor: colorScheme.frontColor,
        rightColor: colorScheme.rightColor,
        backColor: colorScheme.backColor,
        leftColor: colorScheme.leftColor,
        scrambleText: scramble,
        generateImage: true,
        imageSize: scrambleImageSize || 200
    });
}

/*
╔════════════════════════════════════════════════════════════════════════════╗
║                                TEXT MODALS                                 ║
╚════════════════════════════════════════════════════════════════════════════╝
*/

// How to Use Modal Functions
function openHowToUseModal() {
    const modal = document.getElementById('howToUseModal');
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
    
    pushModalState('howToUseModal', closeHowToUseModal);
}

function closeHowToUseModal() {
    const modal = document.getElementById('howToUseModal');
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
}

// Suggest Modal Functions
function openSuggestModal() {
    const modal = document.getElementById('suggestModal');
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
    
    pushModalState('suggestModal', closeSuggestModal);
}

function closeSuggestModal() {
    const modal = document.getElementById('suggestModal');
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
}

// Confession Modal Functions
function openConfessionModal() {
    const modal = document.getElementById('confessionModal');
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
    
    pushModalState('confessionModal', closeConfessionModal);
}

function closeConfessionModal() {
    const modal = document.getElementById('confessionModal');
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
}
