function renderGanttChart(timeline) {
  const container = document.getElementById("ganttChart");
  container.innerHTML = '<h2>Gantt Chart</h2>';

  const chart = document.createElement("div");
  chart.style.display = "flex";

  const seen = new Set();
  let prev = null;

  timeline.forEach(slot => {
    const block = document.createElement("div");
    block.className = "gantt-block";
    block.style.flex = slot.end - slot.start;
    block.textContent = `P${slot.pid}`;
    block.title = `Start: ${slot.start}, End: ${slot.end}`;

    if (!seen.has(slot.pid) || prev !== slot.pid) {
      block.classList.add("flash");
    }

    seen.add(slot.pid);
    prev = slot.pid;
    chart.appendChild(block);
  });

  container.appendChild(chart);
}

