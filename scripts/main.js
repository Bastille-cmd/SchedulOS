let pid = 1;
let processes = [];
let editPID = null;

function addProcess() {
  const arrival = parseInt(document.getElementById('arrival').value);
  const burst = parseInt(document.getElementById('burst').value);
  const priority = parseInt(document.getElementById('priority').value);

  if (isNaN(arrival) || isNaN(burst) || arrival < 0 || burst <= 0) return;

  if (editPID !== null) {
    const index = processes.findIndex(p => p.pid === editPID);
    if (index !== -1) {
      processes[index] = {
        pid: editPID,
        arrival,
        burst,
        priority: isNaN(priority) ? 0 : priority
      };
    }
    editPID = null;
    document.querySelector('.add-process button').textContent = "Add Process";
  } else {
    processes.push({
      pid: pid++,
      arrival,
      burst,
      priority: isNaN(priority) ? 0 : priority
    });
  }

  document.getElementById('arrival').value = "";
  document.getElementById('burst').value = "";
  document.getElementById('priority').value = "";

  updateTable();
}

function updateTable() {
  const tbody = document.getElementById('processTableBody');
  tbody.innerHTML = "";
  processes.forEach(p => {
    const row = `<tr>
      <td>${p.pid}</td>
      <td>${p.arrival}</td>
      <td>${p.burst}</td>
      <td>${p.priority ?? '-'}</td>
      <td><button onclick="editProcess(${p.pid})">Edit</button></td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

function editProcess(id) {
  const p = processes.find(p => p.pid === id);
  if (!p) return;

  document.getElementById('arrival').value = p.arrival;
  document.getElementById('burst').value = p.burst;
  document.getElementById('priority').value = p.priority;

  editPID = id;
  document.querySelector('.add-process button').textContent = "Update Process";
}

function simulate() {
  const algo = document.getElementById('algorithmSelect').value;
  if (processes.length === 0) return;

  const procCopy = processes.map(p => ({ ...p }));
  let timeline = [];

  if (algo === 'fcfs') timeline = fcfs(procCopy);
  else if (algo === 'sjf') timeline = sjf(procCopy);
  else if (algo === 'srtf') timeline = srtf(procCopy);
  else if (algo === 'rr') {
    const quantum = parseInt(document.getElementById('quantumInput')?.value);
    if (isNaN(quantum) || quantum <= 0) return;
    timeline = roundRobin(procCopy, quantum);
  } else if (algo === 'priority') {
    const preemptive = document.getElementById('preemptiveCheckbox')?.checked;
    timeline = priorityScheduling(procCopy, preemptive);
  }

  renderGanttChart(timeline);
  calculateAndShowResults(timeline);
}

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
  let completed = 0;

  for (let p of processes) {
    let completion = 0;
    for (let t of timeline) {
      if (t.pid === p.pid) completion = Math.max(completion, t.end);
    }

    if (completion === 0) continue;

    const tat = completion - p.arrival;
    const wt = tat - p.burst;
    totalTAT += tat;
    totalWT += wt;
    completed++;

    const row = document.createElement('tr');
    row.innerHTML = `<td>${p.pid}</td><td>${p.arrival}</td><td>${p.burst}</td><td>${completion}</td><td>${tat}</td><td>${wt}</td>`;
    table.appendChild(row);
  }

  const container = document.getElementById('resultsContainer');
  container.innerHTML = '<h2>Results</h2>';
  container.appendChild(table);

  if (completed === processes.length) {
    const avgRow = document.createElement('tr');
    avgRow.innerHTML = `<td colspan="4">Averages</td><td>${(totalTAT / completed).toFixed(2)}</td><td>${(totalWT / completed).toFixed(2)}</td>`;
    table.appendChild(avgRow);
  }
}

function resetAll() {
  processes = [];
  pid = 1;
  editPID = null;
  updateTable();
  document.getElementById('ganttChart').innerHTML = '';
  document.getElementById('resultsContainer').innerHTML = '';
  document.querySelector('.add-process button').textContent = "Add Process";
}

function exportToPNG() {
  html2canvas(document.body).then(canvas => {
    const link = document.createElement('a');
    link.download = 'os-simulation.png';
    link.href = canvas.toDataURL();
    link.click();
  });
}

document.getElementById('algorithmSelect').addEventListener('change', () => {
  const algo = document.getElementById('algorithmSelect').value;
  document.getElementById('quantumLabel').style.display = algo === 'rr' ? 'inline-block' : 'none';
  document.getElementById('priorityLabel').style.display = algo === 'priority' ? 'inline-block' : 'none';
});
