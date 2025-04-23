// Magic Solid image upload and display
const magicSolidInput = document.getElementById('magicSolidInput');
const magicSolidGallery = document.getElementById('magicSolidGallery');

// Default Polo Images URLs and names
const defaultPoloImages = [
  { src: 'https://i.imgur.com/1Q9Z1ZL.jpg', name: 'White Polo' },
  { src: 'https://i.imgur.com/2Q9Z2ZL.jpg', name: 'Black Polo' },
  { src: 'https://i.imgur.com/3Q9Z3ZL.jpg', name: 'Charcoal Polo' },
  { src: 'https://i.imgur.com/4Q9Z4ZL.jpg', name: 'Navy Polo' },
  { src: 'https://i.imgur.com/5Q9Z5ZL.jpg', name: 'Burgundy Polo' },
  { src: 'https://i.imgur.com/6Q9Z6ZL.jpg', name: 'Royal Blue Polo' }
];

// Function to add image to Magic Solid Gallery
function addImageToMagicSolidGallery(src, name) {
  const container = document.createElement('div');
  container.className = 'flex flex-col items-center';

  const img = document.createElement('img');
  img.src = src;
  img.alt = name;
  img.className = 'w-full rounded shadow-md';

  const caption = document.createElement('p');
  caption.textContent = name;
  caption.className = 'mt-2 text-gray-700';

  container.appendChild(img);
  container.appendChild(caption);
  magicSolidGallery.appendChild(container);
}

// Load default images on page load
defaultPoloImages.forEach(image => {
  addImageToMagicSolidGallery(image.src, image.name);
});

magicSolidInput.addEventListener('change', function(event) {
  const files = event.target.files;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();
    reader.onload = function(e) {
      addImageToMagicSolidGallery(e.target.result, file.name);
    };
    reader.readAsDataURL(file);
  }
});

// Background removal with original and result preview side by side
const bgRemoveInput = document.getElementById('bgRemoveInput');
const bgRemoveResult = document.getElementById('bgRemoveResult');

bgRemoveInput.addEventListener('change', async function(event) {
  const file = event.target.files[0];
  if (!file) {
    bgRemoveResult.innerHTML = '<span class="text-white/70 italic">No image uploaded yet.</span>';
    return;
  }

  // Check if API key is set
  const apiKey = 'INSERT_YOUR_REMOVE_BG_API_KEY_HERE';
  if (!apiKey || apiKey === 'INSERT_YOUR_REMOVE_BG_API_KEY_HERE') {
    bgRemoveResult.innerHTML = '<span class="text-yellow-300 italic">Background removal API key is not set. Please set your remove.bg API key in scripts.js to use this feature.</span>';
    return;
  }

  // Show original image preview
  const originalImg = document.createElement('img');
  originalImg.src = URL.createObjectURL(file);
  originalImg.alt = 'Original Image';
  originalImg.className = 'max-w-full max-h-64 object-contain rounded shadow-lg mr-4';

  // Container for previews
  const previewContainer = document.createElement('div');
  previewContainer.className = 'flex flex-row justify-center items-center gap-4';

  const originalContainer = document.createElement('div');
  originalContainer.className = 'flex flex-col items-center';
  const originalLabel = document.createElement('p');
  originalLabel.textContent = 'Original Image';
  originalLabel.className = 'text-white/90 mb-2';
  originalContainer.appendChild(originalLabel);
  originalContainer.appendChild(originalImg);

  previewContainer.appendChild(originalContainer);
  bgRemoveResult.innerHTML = '';
  bgRemoveResult.appendChild(previewContainer);

  // Processing message
  const processingMsg = document.createElement('div');
  processingMsg.className = 'flex flex-col items-center';
  processingMsg.innerHTML = '<p class="text-white/90 mb-2">Processing...</p><div class="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>';
  previewContainer.appendChild(processingMsg);

  const formData = new FormData();
  formData.append('image_file', file);
  formData.append('size', 'auto');

  try {
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey
      },
      body: formData
    });
    if (!response.ok) {
      throw new Error('Background removal failed: ' + response.statusText);
    }
    const blob = await response.blob();
    const imgUrl = URL.createObjectURL(blob);
    
    // Remove processing message
    previewContainer.removeChild(processingMsg);
    
    // Add processed image
    const processedContainer = document.createElement('div');
    processedContainer.className = 'flex flex-col items-center';
    const processedLabel = document.createElement('p');
    processedLabel.textContent = 'Background Removed';
    processedLabel.className = 'text-white/90 mb-2';
    
    const removedImg = document.createElement('img');
    removedImg.src = imgUrl;
    removedImg.alt = 'Background Removed Image';
    removedImg.className = 'max-w-full max-h-64 object-contain rounded shadow-lg';
    
    processedContainer.appendChild(processedLabel);
    processedContainer.appendChild(removedImg);
    previewContainer.appendChild(processedContainer);
  } catch (error) {
    // Remove processing message and show error
    previewContainer.removeChild(processingMsg);
    const errorMsg = document.createElement('div');
    errorMsg.className = 'text-red-400 italic ml-4';
    errorMsg.textContent = 'Error: ' + error.message;
    previewContainer.appendChild(errorMsg);
  }
});

// Color Editing - placeholder setup
const colorEditInput = document.getElementById('colorEditInput');
const colorEditCanvas = document.getElementById('colorEditCanvas');
const colorPicker = document.getElementById('colorPicker');
const ctx = colorEditCanvas.getContext('2d');
let originalImage = null;

colorEditInput.addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (!file) {
    ctx.clearRect(0, 0, colorEditCanvas.width, colorEditCanvas.height);
    return;
  }
  const img = new Image();
  img.onload = function() {
    colorEditCanvas.width = img.width;
    colorEditCanvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    originalImage = ctx.getImageData(0, 0, img.width, img.height);
  };
  img.src = URL.createObjectURL(file);
});

colorPicker.addEventListener('input', function() {
  if (!originalImage) return;
  const imageData = ctx.createImageData(originalImage);
  const data = imageData.data;
  const originalData = originalImage.data;
  const newColor = hexToRgb(colorPicker.value);

  for (let i = 0; i < data.length; i += 4) {
    // Simple example: replace non-transparent pixels with new color
    if (originalData[i + 3] > 0) {
      data[i] = newColor.r;
      data[i + 1] = newColor.g;
      data[i + 2] = newColor.b;
      data[i + 3] = originalData[i + 3];
    } else {
      data[i + 3] = 0;
    }
  }
  ctx.putImageData(imageData, 0, 0);
});

function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

// CDR Conversion - placeholder with improved message
document.getElementById('cdrInput').addEventListener('change', function(event) {
  const resultDiv = document.getElementById('cdrConversionResult');
  const file = event.target.files[0];
  if (!file) {
    resultDiv.textContent = 'Please upload a CDR file to convert.';
    return;
  }
  // No client-side CDR conversion possible; show message
  resultDiv.innerHTML = '<span class="text-yellow-300 italic">CDR conversion requires server-side processing or third-party API integration. This feature is coming soon.</span>';
});
