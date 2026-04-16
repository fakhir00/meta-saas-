fetch("http://localhost:3000/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ phase: "intake", answers: [] })
}).then(r => r.json()).then(console.log).catch(console.error);
