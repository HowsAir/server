/**
 * @file burgerMenuLayersControl.js
 * @author Manuel Borregaled
 * @date January 10, 2025
 * @brief A module that adds responsive burger menu functionality to the layers control container
 * /

/**
 * Initializes the responsive layers control functionality
 * @function initializeLayersControl
 * @returns {void} Nothing
 * @throws {Error} If the layers-control-container element is not found in the DOM
 *
 * @example
 * initializeLayersControl();
 */
export function initializeLayersControl() {
  const container = document.getElementById("layers-control-container");

  if (!container) {
    throw new Error("Layers control container element not found");
  }

  // Create burger button
  const burgerButton = document.createElement("button");
  burgerButton.className = "ha-burger-button";
  burgerButton.innerHTML = `
    <span class="ha-burger-line"></span>
    <span class="ha-burger-line"></span>
    <span class="ha-burger-line"></span>
  `;

  // Create wrapper for the content
  const contentWrapper = document.createElement("div");
  contentWrapper.className = "ha-layers-content";

  // Move all existing children to the wrapper
  while (container.children.length > 0) {
    contentWrapper.appendChild(container.children[0]);
  }

  // Add burger and wrapper to container
  container.appendChild(burgerButton);
  container.appendChild(contentWrapper);

  /**
   * Handles the burger button click event
   * @private
   * @listens click
   */
  burgerButton.addEventListener("click", () => {
    container.classList.toggle("ha-collapsed");
    burgerButton.classList.toggle("ha-active");
  });

  // Add media query listener
  const mediaQuery = window.matchMedia("(max-width: 768px)");

  /**
   * Handles the media query change event
   * @private
   * @param {MediaQueryListEvent} e - The media query change event
   */
  const handleMobileChange = (e) => {
    if (e.matches) {
      container.classList.add("ha-collapsed");
    } else {
      container.classList.remove("ha-collapsed");
      burgerButton.classList.remove("ha-active");
    }
  };

  mediaQuery.addListener(handleMobileChange);
  handleMobileChange(mediaQuery);
}
