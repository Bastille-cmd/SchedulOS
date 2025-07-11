let pid = 1;
let processes = [];

// Add a process
function addProcess() {
  const arrival = parseInt(document.getElementById('arrival').value);
  const burst = parseInt(document.getElementById('burst').value);
  const priority = parseInt(document.getElementById('priority').value);

  if (isNaN(arrival) || isNaN(burst) || arrival < 0 || burst <= 0) {
    alert("Enter valid Arrival and Burst times.");
    return;
  }

  processes.push({ pid: pid++, arrival, burst, priority: isNaN(priority) ? 0 : priority });
  updateTable();
}

// Display process table
function updateTable() {
  const tbody = document.getElementById('processTableBody');
  tbody.innerHTML = "";
  processes.forEach(p => {
    const row = `<tr>
      <td>${p.pid}</td>
      <td>${p.arrival}</td>
      <td>${p.burst}</td>
      <td>${p.priority ?? '-'}</td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

// Simulate
function simulate() {
  const algo = document.getElementById('algorithmSelect').value;
  const quantum = parseInt(document.getElementById('quantumInput').value);
  const isPreemptive = document.getElementById('preemptiveCheckbox').checked;

  if (processes.length === 0) {
    alert("Please add at least one process.");
    return;
  }

  let timeline = [];
  const procCopy = processes.map(p => ({ ...p }));

  switch (algo) {
    case 'fcfs':
      timeline = fcfs(procCopy);
      break;
    case 'sjf':
      timeline = sjf(procCopy);
      break;
    case 'srtf':
      timeline = srtf(procCopy);
      break;
    case 'rr':
      if (isNaN(quantum) || quantum <= 0) {
        alert("Enter valid time quantum for Round Robin.");
        return;
      }
      timeline = roundRobin(procCopy, quantum);
      break;
    case 'priority':
      timeline = priorityScheduling(procCopy, isPreemptive);
      break;
  }

  renderGanttChart(timeline);
  calculateAndShowResults(timeline);
}

// Toggle visibility of extra inputs
document.getElementById('algorithmSelect').addEventListener('change', (e) => {
  const value = e.target.value;
  document.getElementById('quantumLabel').style.display = value === 'rr' ? 'inline-block' : 'none';
  document.getElementById('priorityLabel').style.display = value === 'priority' ? 'inline-block' : 'none';
});

// Result Calculation
function calculateAndShowResults(timeline) {
  const table = document.createElement('table');
  table.innerHTML = `
    <tr>
      <th>PID</th>
      <th>Arrival</th>
      <th>Burst</th>
      <th>Completion</th>
      <th>Turnaround</th>
      <th>Waiting</th>
    </tr>
  `;

  let totalTAT = 0, totalWT = 0;

  for (let p of processes) {
    let completion = 0;
    for (let t of timeline) {
      if (t.pid === p.pid) completion = t.end;
    }

    const tat = completion - p.arrival;
    const wt = tat - p.burst;
    totalTAT += tat;
    totalWT += wt;

    const row = document.createElement('tr');
    row.innerHTML = `<td>${p.pid}</td><td>${p.arrival}</td><td>${p.burst}</td><td>${completion}</td><td>${tat}</td><td>${wt}</td>`;
    table.appendChild(row);
  }

  const avgRow = document.createElement('tr');
  avgRow.innerHTML = `<td colspan="4">Averages</td><td>${(totalTAT / processes.length).toFixed(2)}</td><td>${(totalWT / processes.length).toFixed(2)}</td>`;
  table.appendChild(avgRow);

  const container = document.getElementById('resultsContainer');
  container.innerHTML = '<h2>Results</h2>';
  container.appendChild(table);
}

// Reset everything
function resetAll() {
  processes = [];
  pid = 1;
  updateTable();
  document.getElementById('ganttChart').innerHTML = '';
  document.getElementById('resultsContainer').innerHTML = '';
  document.getElementById('quantumInput').value = '';
  document.getElementById('preemptiveCheckbox').checked = false;
}

// Export as PNG
function exportToPNG() {
  html2canvas(document.body).then(canvas => {
    const link = document.createElement('a');
    link.download = 'os-simulation.png';
    link.href = canvas.toDataURL();
    link.click();
  });
}
