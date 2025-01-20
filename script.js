document.addEventListener("DOMContentLoaded", () => {
    const grupoSelect = document.getElementById("grupo-select");
    const ruletaCanvas = document.getElementById("ruleta");
    const resultado = document.getElementById("resultado");
    const girarBtn = document.getElementById("girar-btn");
    const listaGanadores = document.getElementById("lista-ganadores");
    const ctx = ruletaCanvas.getContext("2d");

    let data = {};
    let nombres = [];
    let ganadores = [];
    let currentAngle = 0;

    // Cargar datos del archivo CSV
    fetch('/data/ejemplo.csv')
        .then(response => response.text())
        .then(csv => {
            const lines = csv.trim().split("\n").slice(1); // Ignorar encabezado
            data = {};
            lines.forEach(line => {
                const [grupo, nombre] = line.split(",").map(item => item.trim());
                if (!data[grupo]) data[grupo] = [];
                data[grupo].push(nombre);
            });
            populateSelect();
        })
        .catch(error => console.error("Error al cargar el archivo CSV:", error));

    function populateSelect() {
        grupoSelect.innerHTML = `<option value="">-- Selecciona un grupo --</option>`;
        Object.keys(data).forEach(grupo => {
            const option = document.createElement("option");
            option.value = grupo;
            option.textContent = grupo;
            grupoSelect.appendChild(option);
        });
    }

    grupoSelect.addEventListener("change", () => {
        const grupo = grupoSelect.value;
        nombres = grupo ? data[grupo] : [];
        ganadores = []; // Reiniciar ganadores al cambiar de grupo
        listaGanadores.innerHTML = ""; // Limpiar la lista de ganadores
        drawRuleta();
    });

    function drawRuleta() {
        const numSlices = nombres.length;
        const sliceAngle = (2 * Math.PI) / numSlices;
        ctx.clearRect(0, 0, ruletaCanvas.width, ruletaCanvas.height);

        nombres.forEach((nombre, i) => {
            const startAngle = i * sliceAngle + currentAngle;
            const endAngle = startAngle + sliceAngle;
            ctx.beginPath();
            ctx.moveTo(250, 250); // Centro del canvas
            ctx.arc(250, 250, 250, startAngle, endAngle);
            ctx.fillStyle = i % 2 === 0 ? "#ff5733" : "#33c3ff";
            ctx.fill();
            ctx.stroke();

            // Agregar texto
            ctx.save();
            ctx.translate(250, 250);
            ctx.rotate(startAngle + sliceAngle / 2);
            ctx.textAlign = "right";
            ctx.fillStyle = "#000";
            ctx.font = "16px Arial";
            ctx.fillText(nombre, 230, 5);
            ctx.restore();
        });
    }

    girarBtn.addEventListener("click", () => {
        if (nombres.length === 0) {
            resultado.textContent = "Selecciona un grupo válido.";
            return;
        }

        const spinTime = 3000; // Milisegundos
        const startAngle = currentAngle;
        const endAngle = startAngle + (Math.random() * 10 + 10) * Math.PI;

        const startTime = Date.now();
        const spin = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed < spinTime) {
                currentAngle = startAngle + (endAngle - startAngle) * (elapsed / spinTime);
                drawRuleta();
                requestAnimationFrame(spin);
            } else {
                currentAngle = endAngle % (2 * Math.PI); // Normalizar el ángulo
                drawRuleta();

                // Cálculo del índice seleccionado
                const sliceAngle = (2 * Math.PI) / nombres.length;
                const selectedIndex = Math.floor(nombres.length - ((currentAngle / sliceAngle) % nombres.length)) % nombres.length;

                const ganador = nombres[selectedIndex];
                resultado.textContent = `¡El ganador es: ${ganador}!`;

                // Agregar a la lista de ganadores si no está repetido
                if (!ganadores.includes(ganador)) {
                    ganadores.push(ganador);
                    const li = document.createElement("li");
                    li.textContent = ganador;
                    listaGanadores.appendChild(li);
                } else {
                    resultado.textContent += " (Ya había ganado)";
                }
            }
        };
        spin();
    });
});
