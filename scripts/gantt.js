function renderGanttChart(timeline) {
  const chart = document.getElementById('ganttChart');
  chart.innerHTML = '';

  for (let block of timeline) {
    const div = document.createElement('div');
    div.className = 'gantt-block';
    div.innerText = `P${block.pid}\n${block.start}–${block.end}`;
    chart.appendChild(div);
  }
}
