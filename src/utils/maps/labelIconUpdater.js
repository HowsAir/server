// labelIconUpdater.js

export function addIconToLabel() {
    const parentDiv = document
        .querySelector('#layer-officialStations')
        .closest('.layer-option');

    // Get the existing label
    const existingLabel = parentDiv.querySelector('label');
    existingLabel.className = 'label-with-icon';

    // Store the original text content
    const labelText = existingLabel.textContent.trim();

    // Create a new wrapper for the existing content
    const wrapper = document.createElement('div');
    wrapper.className = 'label-content-wrapper';

    // Get the checkbox
    const checkbox = existingLabel.querySelector('input');

    // Clear the label and rebuild it with the correct structure
    existingLabel.textContent = '';

    // Add checkbox and text to wrapper
    wrapper.appendChild(checkbox);
    wrapper.appendChild(document.createTextNode(labelText));

    // Add wrapper to label
    existingLabel.appendChild(wrapper);

    // Add the icon
    const iconWrapper = document.createElement('div');
    iconWrapper.className = 'icon-wrapper';
    iconWrapper.innerHTML = `
    <img 
      src="https://res.cloudinary.com/dcup5oalu/image/upload/v1733928181/assets/antenna-icon.svg"
      alt="Icon"
      class="marker-svg-icon"
    />
  `;

    existingLabel.appendChild(iconWrapper);
}
