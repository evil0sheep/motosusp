//Dont add the Matter.js module aliases here because we are referencing them through the Matter object for consistency across files

// Import simulation and configuration
import { Simulation } from './Simulation.js';
import { defaultParams } from './config.js';

// Constants
const CANVAS_MARGIN = 50; // Margin from edges
const canvasSize = {
    width: window.innerWidth - 300, // Subtract controls width
    height: window.innerHeight
};

// Initialize when DOM is loaded
window.addEventListener('load', () => {
    // Get controls container
    const controls = document.getElementById('controls');

    // Initialize simulation
    const simulation = new Simulation(document.getElementById('canvas-container'), canvasSize);

    // Create control buttons container
    const controlButtonsContainer = document.createElement('div');
    controlButtonsContainer.style.display = 'flex';
    controlButtonsContainer.style.alignItems = 'center';
    controlButtonsContainer.style.gap = '10px';
    controlButtonsContainer.style.marginBottom = '20px';

    // Create simulation toggle
    const simulationContainer = document.createElement('div');
    simulationContainer.style.display = 'flex';
    simulationContainer.style.alignItems = 'center';
    simulationContainer.style.gap = '10px';

    const simulationCheckbox = document.createElement('input');
    simulationCheckbox.type = 'checkbox';
    simulationCheckbox.id = 'simulationToggle';
    simulationCheckbox.checked = false; // Simulation off by default

    const simulationLabel = document.createElement('label');
    simulationLabel.htmlFor = 'simulationToggle';
    simulationLabel.textContent = 'Run Simulation';
    simulationLabel.style.color = '#666';

    simulationContainer.appendChild(simulationCheckbox);
    simulationContainer.appendChild(simulationLabel);

    // Add reset button to container
    const resetButton = document.createElement('button');
    resetButton.id = 'resetButton';
    resetButton.textContent = 'Reset';
    resetButton.style.padding = '5px 10px';

    controlButtonsContainer.appendChild(simulationContainer);
    controlButtonsContainer.appendChild(resetButton);

    controls.insertBefore(controlButtonsContainer, document.getElementById('sliders-container'));

    // Handle simulation toggle
    simulationCheckbox.addEventListener('change', (e) => {
        simulation.setRunning(e.target.checked);
    });

    // Add space bar handler to toggle simulation
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !e.repeat) {
            e.preventDefault(); // Prevent page scrolling
            simulationCheckbox.checked = !simulationCheckbox.checked;
            simulation.setRunning(simulationCheckbox.checked);
        }
    });

    // Add build timestamp to UI
    const timestampDiv = document.createElement('div');
    timestampDiv.style.position = 'fixed';
    timestampDiv.style.bottom = '10px';
    timestampDiv.style.left = '10px';
    timestampDiv.style.fontSize = '12px';
    timestampDiv.style.color = '#666';
    timestampDiv.style.fontFamily = 'monospace';
    const buildTime = new Date(BUILD_TIMESTAMP);
    timestampDiv.textContent = `Build: ${buildTime.toLocaleString()}`;
    document.body.appendChild(timestampDiv);

    // Create default frame parameters object
    const getDefaultParams = () => {
        return defaultParams;
    };

    // Get current parameters from UI sliders
    const getCurrentParams = () => {
        const currentParams = JSON.parse(JSON.stringify(defaultParams));
        Object.keys(defaultParams.frame).forEach(key => {
            currentParams.frame[key].value = parseInt(document.getElementById(key).value)/1000;
        });
        return currentParams;
    };

    // Initialize the world with default values
    simulation.createWorld(getDefaultParams());

    // Create gravity toggle
    const gravityContainer = document.createElement('div');
    gravityContainer.style.marginBottom = '20px';
    gravityContainer.style.display = 'flex';
    gravityContainer.style.alignItems = 'center';
    gravityContainer.style.gap = '10px';

    const gravityCheckbox = document.createElement('input');
    gravityCheckbox.type = 'checkbox';
    gravityCheckbox.id = 'gravityToggle';
    gravityCheckbox.checked = true; // Gravity on by default to match physics.js

    const gravityLabel = document.createElement('label');
    gravityLabel.htmlFor = 'gravityToggle';
    gravityLabel.textContent = 'Enable Gravity';
    gravityLabel.style.color = '#666';

    gravityContainer.appendChild(gravityCheckbox);
    gravityContainer.appendChild(gravityLabel);

    controls.insertBefore(gravityContainer, document.getElementById('sliders-container'));

    // Handle gravity toggle
    gravityCheckbox.addEventListener('change', (e) => {
        const gravity = e.target.checked ? 9.81 : 0;
        simulation.world.setGravity({ x: 0, y: gravity });
    });

    // Create UI controls
    const slidersContainer = document.getElementById('sliders-container');
    Object.entries(defaultParams.frame).forEach(([key, config]) => {
        const value_mm = config.value * 1000;

        const container = document.createElement('div');
        container.className = 'slider-container';
        container.style.marginBottom = '15px';
        
        // Top row container
        const topRow = document.createElement('div');
        topRow.style.display = 'flex';
        topRow.style.alignItems = 'center';
        topRow.style.gap = '10px';
        topRow.style.marginBottom = '5px';
        topRow.style.justifyContent = 'space-between';
        
        const label = document.createElement('label');
        label.htmlFor = key;
        label.textContent = config.displayName;
        label.style.minWidth = '120px';
        
        // Right-aligned container for text input and units
        const rightContainer = document.createElement('div');
        rightContainer.style.display = 'flex';
        rightContainer.style.alignItems = 'center';
        rightContainer.style.gap = '5px';
        
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.id = `${key}Text`;
        textInput.className = 'value-input';
        textInput.value = value_mm;
        textInput.style.width = '60px';
        textInput.style.textAlign = 'right';
        
        const unitSpan = document.createElement('span');
        unitSpan.className = 'unit-display';
        unitSpan.textContent = 'mm';
        unitSpan.style.minWidth = '40px';
        
        // Bottom row container
        const bottomRow = document.createElement('div');
        bottomRow.style.width = '100%';
        
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.id = key;
        slider.min = Math.round(value_mm * 0.5); // 50% of default
        slider.max = Math.round(value_mm * 1.5); // 150% of default
        slider.value = value_mm;
        slider.style.width = '100%';
        
        // Assemble the layout
        rightContainer.appendChild(textInput);
        rightContainer.appendChild(unitSpan);
        topRow.appendChild(label);
        topRow.appendChild(rightContainer);
        bottomRow.appendChild(slider);
        
        container.appendChild(topRow);
        container.appendChild(bottomRow);
        slidersContainer.appendChild(container);
    });

    // UI Event Handlers
    // Handle slider changes
    const sliders = document.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
        slider.addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById(`${e.target.id}Text`).value = value;
            
            const currentParams = getCurrentParams();
            try {
                simulation.updateBodies(currentParams);
            } catch (error) {
                // Revert the slider to its previous value
                e.target.value = e.target.defaultValue;
                document.getElementById(`${e.target.id}Text`).value = e.target.defaultValue;
                alert(error.message);
            }
        });
    });

    // Handle text input changes
    const textInputs = document.querySelectorAll('input[type="text"]');
    textInputs.forEach(textInput => {
        textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const value = parseInt(e.target.value);
                const paramKey = e.target.id.replace('Text', '');
                const slider = document.getElementById(paramKey);
                const min = parseInt(slider.min);
                const max = parseInt(slider.max);
                
                if (isNaN(value) || value < min || value > max) {
                    // Revert to previous value if invalid
                    e.target.value = slider.value;
                    alert(`Please enter a valid number between ${min} and ${max}`);
                    return;
                }
                
                // Update slider
                slider.value = value;
                
                const currentParams = getCurrentParams();
                try {
                    simulation.updateBodies(currentParams);
                } catch (error) {
                    // Revert all values on error
                    slider.value = slider.defaultValue;
                    e.target.value = slider.defaultValue;
                    alert(error.message);
                }
            }
        });
    });

    // Handle reset button
    resetButton.addEventListener('click', () => {
        // Reset all sliders to default values
        Object.entries(defaultParams.frame).forEach(([key, config]) => {
            const value_mm = config.value * 1000;
            const slider = document.getElementById(key);
            const textInput = document.getElementById(`${key}Text`);
            slider.value = value_mm;
            textInput.value = value_mm;
        });

        // Reset simulation
        simulation.createWorld(getDefaultParams());
    });
}); 