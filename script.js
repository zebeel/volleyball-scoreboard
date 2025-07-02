        // Game state
        let gameState = {
            scoreA: 0,
            scoreB: 0,
            setsA: 0,
            setsB: 0,
            lastScorer: null,
            isFirstPoint: true
        };

        // Settings
        let settings = {
            teamAName: 'Đội A',
            teamBName: 'Đội B',
            winPoints: 25,
            winSets: 3,
            confirmScore: true,
            speechEnabled: true,
            speechRate: 1.0
        };

        // History for undo
        let history = [];

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            loadSettings();
            updateDisplay();
            speak("Bắt đầu trận đấu");
            
            // Keyboard shortcuts
            document.addEventListener('keydown', function(e) {
                if (e.key === 'ArrowLeft') {
                    addPoint('A');
                } else if (e.key === 'ArrowRight') {
                    addPoint('B');
                } else if (e.ctrlKey && e.key === 'z') {
                    e.preventDefault();
                    undo();
                }
            });
        });

        // Save state to history
        function saveToHistory() {
            history.push({
                scoreA: gameState.scoreA,
                scoreB: gameState.scoreB,
                setsA: gameState.setsA,
                setsB: gameState.setsB,
                lastScorer: gameState.lastScorer,
                isFirstPoint: gameState.isFirstPoint
            });
        }

        // Add point to team
        function addPoint(team) {
            if (settings.confirmScore) {
                showConfirmModal(team);
            } else {
                executeAddPoint(team);
            }
        }

        function executeAddPoint(team) {
            saveToHistory();
            
            const teamElement = document.getElementById('team' + team);
            teamElement.classList.add('pulse');
            setTimeout(() => teamElement.classList.remove('pulse'), 500);

            if (team === 'A') {
                gameState.scoreA++;
                document.getElementById('scoreA').textContent = gameState.scoreA;
            } else {
                gameState.scoreB++;
                document.getElementById('scoreB').textContent = gameState.scoreB;
            }
            
            // Check for set win first
            const hasWinner = checkSetWin();
            
            // Only announce score if no winner
            if (!hasWinner && settings.speechEnabled) {
                announceScore(team);
            }
            gameState.lastScorer = team;
            gameState.isFirstPoint = false;
        }

        function announceScore(team) {
            let announcement = "";
            
            if (gameState.isFirstPoint) {
                announcement = `Điểm cho ${settings['team' + team + 'Name']}. `;
            } else if (gameState.lastScorer !== team) {
                announcement = `Đổi điểm cho ${settings['team' + team + 'Name']}. `;
            } else {
                announcement = `Điểm cho ${settings['team' + team + 'Name']}. `;
            }

            // Add score - team that scored gets their score read first
            if (gameState.scoreA === gameState.scoreB) {
                announcement += `${gameState.scoreA} đều`;
            } else {
                if (team === 'A') {
                    announcement += `${gameState.scoreA} - ${gameState.scoreB}`;
                } else {
                    announcement += `${gameState.scoreB} - ${gameState.scoreA}`;
                }
            }

            speak(announcement);
        }

        function checkSetWin() {
            let winner = null;
            const scoreA = gameState.scoreA;
            const scoreB = gameState.scoreB;
            const minWin = settings.winPoints;

            if ((scoreA >= minWin || scoreB >= minWin) && Math.abs(scoreA - scoreB) >= 2) {
                if (scoreA > scoreB) {
                    winner = 'A';
                    gameState.setsA++;
                } else {
                    winner = 'B';
                    gameState.setsB++;
                }

                updateDisplay();
                
                // Check for match win
                if (gameState.setsA >= settings.winSets || gameState.setsB >= settings.winSets) {
                    setTimeout(() => showMatchWinner(winner), 500);
                } else {
                    setTimeout(() => showSetWinner(winner), 500);
                }
                
                return true; // Has winner
            }
            
            return false; // No winner
        }

        function showSetWinner(winner) {
            createFireworks();
            const winnerName = settings['team' + winner + 'Name'];
            speak(`Chúc mừng ${winnerName} chiến thắng set đấu với tỉ số là ${gameState.scoreA} - ${gameState.scoreB}`);
            
            showModal(`
                <div class="winner-modal">
                    <div class="winner-title">🏆 Set Win!</div>
                    <div class="winner-subtitle">Chúc mừng ${winnerName} thắng set đấu!</div>
                    <div style="font-size: 1.2rem; margin-bottom: 20px;">Tỉ số: ${gameState.scoreA} - ${gameState.scoreB}</div>
                    <button class="btn btn-success" onclick="nextSet()">Tiếp tục set tiếp theo?</button>
                </div>
            `);
        }

        function showMatchWinner(winner) {
            console.log('Match winner:', winner);
            console.log('setting', settings);
            console.log('gameState', gameState);
            createFireworks();
            const winnerName = settings['team' + winner + 'Name'];
            speak(`Chúc mừng ${winnerName} chiến thắng với tỉ số set chung cuộc là ${winner == 'A' ? gameState.setsA : gameState.setsB} - ${winner == 'A' ? gameState.setsB : gameState.setsA}`);
            
            showModal(`
                <div class="winner-modal">
                    <div class="winner-title">🎉 Match Winner!</div>
                    <div class="winner-subtitle">Chúc mừng ${winnerName} chiến thắng trận đấu!</div>
                    <div style="font-size: 1.2rem; margin-bottom: 20px;">Tỉ số set: ${winner == 'A' ? gameState.setsA : gameState.setsB} - ${winner == 'A' ? gameState.setsB : gameState.setsA}</div>
                    <button class="btn btn-success" onclick="newMatch()">Tiếp tục trận tiếp theo?</button>
                </div>
            `);
        }

        function nextSet() {
            closeModals();
            gameState.scoreA = 0;
            gameState.scoreB = 0;
            gameState.isFirstPoint = true;
            gameState.lastScorer = null;
            history = [];
            updateDisplay();
            speak("Bắt đầu trận đấu");
        }

        function createFireworks() {
            const fireworksContainer = document.getElementById('fireworks');
            const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
            
            for (let i = 0; i < 50; i++) {
                setTimeout(() => {
                    const firework = document.createElement('div');
                    firework.className = 'firework';
                    firework.style.left = Math.random() * window.innerWidth + 'px';
                    firework.style.top = Math.random() * window.innerHeight + 'px';
                    firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                    fireworksContainer.appendChild(firework);
                    
                    setTimeout(() => {
                        firework.remove();
                    }, 1000);
                }, i * 50);
            }
        }

        function speak(text) {
            if (!settings.speechEnabled) return;

            const voices = window.speechSynthesis.getVoices();
            const vietnameseVoice = voices.find(voice => voice.lang === 'vi-VN');

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'vi-VN';
            utterance.rate = settings.speechRate;

            if (vietnameseVoice) {
                utterance.voice = vietnameseVoice;
            }

            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        }

        function undo() {
            if (history.length === 0) return;
            
            const previousState = history.pop();
            gameState = { ...previousState };
            updateDisplay();
        }

        function resetSet() {
            saveToHistory();
            gameState.scoreA = 0;
            gameState.scoreB = 0;
            gameState.isFirstPoint = true;
            gameState.lastScorer = null;
            updateDisplay();
            speak("Bắt đầu trận đấu");
        }

        function newMatch() {
            closeModals();
            gameState = {
                scoreA: 0,
                scoreB: 0,
                setsA: 0,
                setsB: 0,
                lastScorer: null,
                isFirstPoint: true
            };
            history = [];
            updateDisplay();
            speak("Bắt đầu trận đấu");
        }

        function updateDisplay() {
            document.getElementById('scoreA').textContent = gameState.scoreA;
            document.getElementById('scoreB').textContent = gameState.scoreB;
            document.getElementById('setsA').textContent = gameState.setsA;
            document.getElementById('setsB').textContent = gameState.setsB;
            document.getElementById('teamAName').textContent = settings.teamAName;
            document.getElementById('teamBName').textContent = settings.teamBName;
        }

        // Team click handlers
        document.getElementById('teamA').addEventListener('click', () => addPoint('A'));
        document.getElementById('teamB').addEventListener('click', () => addPoint('B'));

        // Settings functions
        function toggleSettings() {
            const panel = document.getElementById('settingsPanel');
            const overlay = document.getElementById('overlay');
            
            if (panel.classList.contains('active')) {
                panel.classList.remove('active');
                overlay.classList.remove('active');
            } else {
                panel.classList.add('active');
                overlay.classList.add('active');
                loadSettingsToUI();
            }
        }

        function loadSettingsToUI() {
            document.getElementById('teamANameInput').value = settings.teamAName;
            document.getElementById('teamBNameInput').value = settings.teamBName;
            document.getElementById('winPointsInput').value = settings.winPoints;
            document.getElementById('winSetsInput').value = settings.winSets;
            document.getElementById('confirmScoreInput').checked = settings.confirmScore;
            document.getElementById('speechEnabledInput').checked = settings.speechEnabled;
        }

        function saveSettings() {
            settings.teamAName = document.getElementById('teamANameInput').value || 'Đội A';
            settings.teamBName = document.getElementById('teamBNameInput').value || 'Đội B';
            settings.winPoints = parseInt(document.getElementById('winPointsInput').value) || 25;
            settings.winSets = parseInt(document.getElementById('winSetsInput').value) || 3;
            settings.confirmScore = document.getElementById('confirmScoreInput').checked;
            settings.speechEnabled = document.getElementById('speechEnabledInput').checked;
            
            updateDisplay();
            toggleSettings();
            
            // Save to localStorage equivalent (in-memory for this demo)
            localStorage?.setItem('volleyballSettings', JSON.stringify(settings));
        }

        function loadSettings() {
            try {
                const saved = localStorage?.getItem('volleyballSettings');
                if (saved) {
                    settings = { ...settings, ...JSON.parse(saved) };
                }
            } catch (e) {
                console.log('Could not load settings');
            }
        }

        function setSpeechRate(rate) {
            settings.speechRate = rate;
            
            // Update UI
            document.querySelectorAll('.speed-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
        }

        // Modal functions
        function showConfirmModal(team) {
            const teamName = settings['team' + team + 'Name'];
            showModal(`
                <div class="modal">
                    <h2>Xác nhận ghi điểm</h2>
                    <p>Tăng điểm cho ${teamName}?</p>
                    <div class="modal-buttons">
                        <button class="btn btn-success" onclick="confirmAddPoint('${team}')">Có</button>
                        <button class="btn btn-warning" onclick="closeModals()">Không</button>
                    </div>
                </div>
            `);
        }

        function confirmAddPoint(team) {
            closeModals();
            executeAddPoint(team);
        }

        function showModal(content) {
            document.getElementById('overlay').innerHTML = content;
            document.getElementById('overlay').classList.add('active');
            
            // Prevent modal from closing when clicking outside
            document.getElementById('overlay').onclick = function(e) {
                e.stopPropagation();
            };
        }

        function closeModals() {
            document.getElementById('overlay').innerHTML = '';
            document.getElementById('overlay').classList.remove('active');
            document.getElementById('settingsPanel').classList.remove('active');
        }

        function toggleFullscreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(console.log);
            } else {
                document.exitFullscreen().catch(console.log);
            }
        }
