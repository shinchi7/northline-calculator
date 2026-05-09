const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const DATA_FILE = path.join(__dirname, 'data', 'papers.json');
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function loadPapers() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function savePapers(papers) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(papers, null, 2));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

app.get('/api/papers', (req, res) => {
  res.json(loadPapers());
});

app.post('/api/papers', (req, res) => {
  const { name, width, height, price } = req.body;
  if (!name || !width || !height || price == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const papers = loadPapers();
  const paper = { id: uid(), name, width: Number(width), height: Number(height), price: Number(price) };
  papers.push(paper);
  savePapers(papers);
  res.status(201).json(paper);
});

app.put('/api/papers/:id', (req, res) => {
  const papers = loadPapers();
  const idx = papers.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Paper not found' });
  const { name, width, height, price } = req.body;
  papers[idx] = { id: req.params.id, name, width: Number(width), height: Number(height), price: Number(price) };
  savePapers(papers);
  res.json(papers[idx]);
});

app.delete('/api/papers/:id', (req, res) => {
  const papers = loadPapers();
  const filtered = papers.filter(p => p.id !== req.params.id);
  if (filtered.length === papers.length) return res.status(404).json({ error: 'Paper not found' });
  savePapers(filtered);
  res.status(204).end();
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
