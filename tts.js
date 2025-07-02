    class VietnameseTextReader {
        constructor() {
            this.synth = window.speechSynthesis;
            this.utterance = null;
            this.voices = [];
            this.isPlaying = false;
            this.isPaused = false;

            this.initElements();
            this.loadVoices();
            this.bindEvents();
            this.setupSamples();
        }

        initElements() {
            this.textInput = document.getElementById('textInput');
            this.voiceSelect = document.getElementById('voiceSelect');
            this.rateRange = document.getElementById('rateRange');
            this.rateValue = document.getElementById('rateValue');
            this.playBtn = document.getElementById('playBtn');
            this.pauseBtn = document.getElementById('pauseBtn');
            this.stopBtn = document.getElementById('stopBtn');
            this.status = document.getElementById('status');
        }

        setupSamples() {
            this.sampleTexts = [
                "Xin chào! Chúc bạn một ngày tốt lành. Hy vọng bạn sẽ có những trải nghiệm thú vị với ứng dụng này.",
                "Trên đỉnh núi cao, mây trắng bay lơ lửng. Gió thổi nhẹ qua những tán lá xanh mướt. Thiên nhiên Việt Nam thật đẹp và hùng vĩ.",
                "Hôm nay thời tiết khá đẹp với nắng nhẹ và mây ít. Nhiệt độ dao động từ 25 đến 30 độ C. Đây là thời tiết lý tưởng để đi dạo và thư giãn."
            ];
        }

        loadVoices() {
            const updateVoices = () => {
                this.voices = this.synth.getVoices();
                this.populateVoiceSelect();
            };

            updateVoices();
            if (speechSynthesis.onvoiceschanged !== undefined) {
                speechSynthesis.onvoiceschanged = updateVoices;
            }
        }

        populateVoiceSelect() {
            this.voiceSelect.innerHTML = '';
            
            // Tìm giọng tiếng Việt
            const vietnameseVoices = this.voices.filter(voice => 
                voice.lang.includes('vi') || 
                voice.name.toLowerCase().includes('vietnam') ||
                voice.name.toLowerCase().includes('vietnamese')
            );

            // Nếu có giọng tiếng Việt, ưu tiên sử dụng
            if (vietnameseVoices.length > 0) {
                vietnameseVoices.forEach(voice => {
                    const option = document.createElement('option');
                    option.value = voice.name;
                    option.textContent = `${voice.name} (${voice.lang})`;
                    this.voiceSelect.appendChild(option);
                });
            } else {
                // Nếu không có giọng tiếng Việt, hiển thị tất cả giọng
                this.voices.forEach(voice => {
                    const option = document.createElement('option');
                    option.value = voice.name;
                    option.textContent = `${voice.name} (${voice.lang})`;
                    this.voiceSelect.appendChild(option);
                });
            }
        }

        bindEvents() {
            this.playBtn.addEventListener('click', () => this.play());
            this.pauseBtn.addEventListener('click', () => this.pause());
            this.stopBtn.addEventListener('click', () => this.stop());
            
            this.rateRange.addEventListener('input', (e) => {
                this.rateValue.textContent = e.target.value;
            });

            // Xử lý khi synthesis kết thúc
            this.synth.addEventListener('voiceschanged', () => this.loadVoices());
        }

        play() {
            const text = this.textInput.value.trim();
            if (!text) {
                alert('Vui lòng nhập văn bản để đọc!');
                return;
            }

            if (this.isPaused) {
                this.synth.resume();
                this.isPaused = false;
            } else {
                this.stop(); // Dừng utterance hiện tại nếu có
                
                this.utterance = new SpeechSynthesisUtterance(text);
                
                // Chọn giọng
                const selectedVoiceName = this.voiceSelect.value;
                const selectedVoice = this.voices.find(voice => voice.name === selectedVoiceName);
                if (selectedVoice) {
                    this.utterance.voice = selectedVoice;
                }

                // Cài đặt tốc độ
                this.utterance.rate = parseFloat(this.rateRange.value);
                this.utterance.pitch = 1;
                this.utterance.volume = 1;

                // Xử lý sự kiện
                this.utterance.onstart = () => {
                    this.isPlaying = true;
                    this.updateUI();
                    this.updateStatus('Đang đọc...', 'speaking');
                };

                this.utterance.onend = () => {
                    this.isPlaying = false;
                    this.isPaused = false;
                    this.updateUI();
                    this.updateStatus('Đã hoàn thành', 'stopped');
                };

                this.utterance.onerror = (event) => {
                    console.error('Lỗi khi đọc:', event.error);
                    this.isPlaying = false;
                    this.isPaused = false;
                    this.updateUI();
                    this.updateStatus('Có lỗi xảy ra', 'stopped');
                };

                this.synth.speak(this.utterance);
            }

            this.updateUI();
        }

        pause() {
            if (this.isPlaying && !this.isPaused) {
                this.synth.pause();
                this.isPaused = true;
                this.updateUI();
                this.updateStatus('Đã tạm dừng', 'paused');
            }
        }

        stop() {
            this.synth.cancel();
            this.isPlaying = false;
            this.isPaused = false;
            this.updateUI();
            this.updateStatus('Đã dừng', 'stopped');
        }

        updateUI() {
            this.playBtn.disabled = this.isPlaying && !this.isPaused;
            this.pauseBtn.disabled = !this.isPlaying || this.isPaused;
            this.stopBtn.disabled = !this.isPlaying;

            if (this.isPaused) {
                this.playBtn.innerHTML = '▶️ Tiếp tục';
            } else {
                this.playBtn.innerHTML = '▶️ Đọc';
            }
        }

        updateStatus(message, className) {
            this.status.textContent = message;
            this.status.className = `status ${className}`;
        }
    }

    // Khởi tạo ứng dụng
    const reader = new VietnameseTextReader();

    // Hàm để load văn bản mẫu
    function loadSample(index) {
        const textInput = document.getElementById('textInput');
        textInput.value = reader.sampleTexts[index];
    }

    // Kiểm tra hỗ trợ Speech Synthesis
    if (!('speechSynthesis' in window)) {
        alert('Trình duyệt của bạn không hỗ trợ tính năng đọc văn bản. Vui lòng sử dụng trình duyệt khác như Chrome, Firefox, hay Safari.');
    }
