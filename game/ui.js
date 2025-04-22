// File: game/ui.js

export function createGameUI() {
  // Create UI container
  const uiContainer = document.createElement('div');
  uiContainer.id = 'ui-container';
  uiContainer.style.position = 'absolute';
  uiContainer.style.top = '10px';
  uiContainer.style.right = '10px';
  uiContainer.style.zIndex = '10';
  document.body.appendChild(uiContainer);

  // Turn Info Display
  const turnInfo = document.createElement('div');
  turnInfo.id = 'turnInfo';
  turnInfo.textContent = 'Current Turn: Loading...';
  uiContainer.appendChild(turnInfo);

  // End Turn Button
  const endTurnBtn = document.createElement('button');
  endTurnBtn.id = 'endTurnBtn';
  endTurnBtn.textContent = 'End Turn';
  uiContainer.appendChild(endTurnBtn);

  // Action Button
  const actionBtn = document.createElement('button');
  actionBtn.id = 'actionBtn';
  actionBtn.textContent = 'Action';
  uiContainer.appendChild(actionBtn);
}

export function updateTurnDisplay(turn) {
  const turnInfo = document.getElementById('turnInfo');
  if (turnInfo) {
    turnInfo.textContent = `Current Turn: ${turn}`;
  }
}
