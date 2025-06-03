const wheel = document.getElementById('wheel');
const spinBtn = document.getElementById('spin-btn');
const result = document.getElementById('result');

const segments = [
  { label: '1 triệu đồng', color: '#90EE90', weight: 0 },
  { label: '100k', color: '#FFD700', weight: 0 },
  { label: '200k', color: '#006400', weight: 0 },
  { label: '500k', color: '#9ACD32', weight: 0 },
  { label: '50k', color: '#FFA500', weight: 0 },
  { label: '20k', color: '#FFFFE0', weight: 0 },
  { label: 'Trả lời thêm câu nữa', color: '#006400', weight: 1 },
  { label: 'Bắt tay với Lê Nhật', color: '#FFA500', weight: 1 },
  { label: 'Một tràng vỗ tay', color: '#FFFFE0', weight: 1 },
  { label: 'Được nhận xét phần thuyết trình', color: '#006400', weight: 1 },
];

const ctx = wheel.getContext('2d');

let currentRotation = 0;
let isSpinning = false;

const winningIndices = [7, 8, 9]; // 3 ô không tiền

function drawWheel() {
  const centerX = wheel.width / 2;
  const centerY = wheel.height / 2;
  const radius = wheel.width / 2 - 10;

  ctx.clearRect(0, 0, wheel.width, wheel.height);

  segments.forEach((segment, index) => {
    const startAngle = (index * (360 / segments.length)) * (Math.PI / 180);
    const endAngle = ((index + 1) * (360 / segments.length)) * (Math.PI / 180);

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = segment.color;
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + (endAngle - startAngle) / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#000';
    ctx.font = '14px Arial';
    ctx.fillText(segment.label, radius - 10, 5);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
  ctx.fillStyle = '#3498db';
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SPIN', centerX, centerY);
}

function rotateWheel(angle) {
  ctx.save();
  ctx.clearRect(0, 0, wheel.width, wheel.height);
  ctx.translate(wheel.width / 2, wheel.height / 2);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.translate(-wheel.width / 2, -wheel.height / 2);
  drawWheel();
  ctx.restore();
}

function getSegmentIndexFromRotation(rotation) {
  const degreesPerSegment = 360 / segments.length;
  const normalizedDegree = rotation % 360;
  const pointerDegree = (360 - normalizedDegree + degreesPerSegment / 2) % 360;
  return Math.floor(pointerDegree / degreesPerSegment);
}

function weightedRandomSegment() {
  const totalWeight = winningIndices.length;
  let random = Math.floor(Math.random() * totalWeight);
  return winningIndices[random];
}

function spin() {
  if (isSpinning) return;
  isSpinning = true;
  result.textContent = '';

  const degreesPerSegment = 360 / segments.length;
  const chosenIndex = weightedRandomSegment();
  const randomOffset = Math.random() * degreesPerSegment * 0.6 + degreesPerSegment * 0.2;

  let targetAngle =
    360 * (3 + Math.random() * 2) +
    (segments.length - chosenIndex - 1) * degreesPerSegment +
    randomOffset;

  const duration = 5000;
  const startTime = performance.now();
  const startRotation = currentRotation;

  function animateSpin(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);

    currentRotation = startRotation + targetAngle * easeOut;
    rotateWheel(currentRotation);

    if (progress < 1) {
      requestAnimationFrame(animateSpin);
    } else {
      const stoppedIndex = getSegmentIndexFromRotation(currentRotation);

      if (winningIndices.includes(stoppedIndex)) {
        isSpinning = false;
        const segment = segments[stoppedIndex];
        result.textContent = `Xin chúc mừng, bạn đã nhận được ${segment.label}`;
      } else {
        // Bắt đầu nhích từng ô đến ô không tiền
        let currentIndex = stoppedIndex;

        function step() {
          currentIndex++;
          if (currentIndex >= segments.length) currentIndex = 0;

          const currentPos = currentRotation % 360;
          const targetPos = (segments.length - currentIndex - 1) * degreesPerSegment + degreesPerSegment / 2;
          let diff = (targetPos - currentPos + 360) % 360;

          const stepDuration = 300;
          const stepStartRotation = currentRotation;
          const stepStartTime = performance.now();

          function animateStep(time) {
            const stepElapsed = time - stepStartTime;
            const stepProgress = Math.min(stepElapsed / stepDuration, 1);
            const easeStep = 1 - Math.pow(1 - stepProgress, 3);

            currentRotation = stepStartRotation + diff * easeStep;
            rotateWheel(currentRotation);

            if (stepProgress < 1) {
              requestAnimationFrame(animateStep);
            } else {
              // Nếu ô hiện tại là ô không tiền thì dừng, ngược lại tiếp tục nhích
              if (winningIndices.includes(currentIndex)) {
                isSpinning = false;
                const segment = segments[currentIndex];
                result.textContent = `Xin chúc mừng, bạn đã nhận được ${segment.label}`;
              } else {
                step();
              }
            }
          }
          requestAnimationFrame(animateStep);
        }

        step();
      }
    }
  }

  requestAnimationFrame(animateSpin);
}


drawWheel();
spinBtn.addEventListener('click', spin);
