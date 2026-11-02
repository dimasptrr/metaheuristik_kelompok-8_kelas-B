/**
 * BENCHMARK OBJECTIVE FUNCTIONS
 * Standar Fungsi Uji Optimasi Kontinu (Unimodal & Multimodal)
 * Menyediakan evaluasi 2D dan D-dimensi dengan batas pencarian presisi IEEE-754 FP64.
 */
(function() {
  window.MetaOpt = window.MetaOpt || {};

  const BENCHMARKS = {
    sphere: {
      id: 'sphere',
      name: 'Sphere Function',
      type: 'Unimodal (Konveks / Mangkuk)',
      domain: [-5.12, 5.12],
      formulaLatex: 'f(\\mathbf{x}) = \\sum_{i=1}^{D} x_i^2',
      formulaText: 'f(x) = x₁² + x₂²',
      optimumCoord: [0, 0],
      optimumVal: 0.0,
      description: 'Fungsi unimodal simetris dengan gradien mulus. Menguji kecepatan konvergensi eksploitasi algoritma menuju titik global minimum di (0, 0).',
      // Evaluasi 2D cepat
      eval2D: function(x, y) {
        return x * x + y * y;
      },
      // Evaluasi D-dimensi umum
      evalND: function(vec) {
        let sum = 0;
        for (let i = 0; i < vec.length; i++) {
          sum += vec[i] * vec[i];
        }
        return sum;
      }
    },

    rastrigin: {
      id: 'rastrigin',
      name: 'Rastrigin Function',
      type: 'Multimodal (Gelombang Sinusoidal)',
      domain: [-5.12, 5.12],
      formulaLatex: 'f(\\mathbf{x}) = 10D + \\sum_{i=1}^{D} \\left[ x_i^2 - 10\\cos(2\\pi x_i) \\right]',
      formulaText: 'f(x) = 20 + x₁² + x₂² - 10(cos(2πx₁) + cos(2πx₂))',
      optimumCoord: [0, 0],
      optimumVal: 0.0,
      description: 'Fungsi non-linear multimodal dengan ribuan optimum lokal terdistribusi reguler. Menguji kemampuan eksplorasi global agar tidak terjebak dalam jebakan lokal (local optima).',
      eval2D: function(x, y) {
        return 20 + (x * x - 10 * Math.cos(2 * Math.PI * x)) + (y * y - 10 * Math.cos(2 * Math.PI * y));
      },
      evalND: function(vec) {
        const D = vec.length;
        let sum = 10 * D;
        for (let i = 0; i < D; i++) {
          sum += vec[i] * vec[i] - 10 * Math.cos(2 * Math.PI * vec[i]);
        }
        return sum;
      }
    },

    rosenbrock: {
      id: 'rosenbrock',
      name: 'Rosenbrock Valley (Banana Function)',
      type: 'Unimodal / Lemah Multimodal (Lembah Parabolik Curam)',
      domain: [-2.048, 2.048],
      formulaLatex: 'f(\\mathbf{x}) = \\sum_{i=1}^{D-1} \\left[ 100(x_{i+1} - x_i^2)^2 + (1 - x_i)^2 \\right]',
      formulaText: 'f(x) = 100(x₂ - x₁²)² + (1 - x₁)²',
      optimumCoord: [1, 1],
      optimumVal: 0.0,
      description: 'Lembah sempit parabolik di mana menemukan lembah relatif mudah, namun menelusuri dasar lembah berliku menuju titik minimum global (1, 1) sangat menantang.',
      eval2D: function(x, y) {
        return 100 * Math.pow(y - x * x, 2) + Math.pow(1 - x, 2);
      },
      evalND: function(vec) {
        let sum = 0;
        for (let i = 0; i < vec.length - 1; i++) {
          const xi = vec[i];
          const xnext = vec[i + 1];
          sum += 100 * Math.pow(xnext - xi * xi, 2) + Math.pow(1 - xi, 2);
        }
        return sum;
      }
    },

    ackley: {
      id: 'ackley',
      name: 'Ackley Function',
      type: 'Multimodal (Kawah Curam Terpusat)',
      domain: [-5.0, 5.0],
      formulaLatex: 'f(\\mathbf{x}) = -20\\exp\\left(-0.2\\sqrt{\\frac{1}{D}\\sum_{i=1}^D x_i^2}\\right) - \\exp\\left(\\frac{1}{D}\\sum_{i=1}^D \\cos(2\\pi x_i)\\right) + 20 + e',
      formulaText: 'f(x) = -20·exp(-0.2√(0.5(x₁²+x₂²))) - exp(0.5(cos(2πx₁)+cos(2πx₂))) + 20 + e',
      optimumCoord: [0, 0],
      optimumVal: 0.0,
      description: 'Karakteristik permukaan datar di area luar dengan riak modulasi kosinus frekuensi tinggi, berujung pada corong kawah yang sangat dalam di pusat (0, 0).',
      eval2D: function(x, y) {
        const sumSq = 0.5 * (x * x + y * y);
        const sumCos = 0.5 * (Math.cos(2 * Math.PI * x) + Math.cos(2 * Math.PI * y));
        const p1 = -20 * Math.exp(-0.2 * Math.sqrt(sumSq));
        const p2 = -Math.exp(sumCos);
        return p1 + p2 + 20 + Math.E;
      },
      evalND: function(vec) {
        const D = vec.length;
        let sumSq = 0;
        let sumCos = 0;
        for (let i = 0; i < D; i++) {
          sumSq += vec[i] * vec[i];
          sumCos += Math.cos(2 * Math.PI * vec[i]);
        }
        const p1 = -20 * Math.exp(-0.2 * Math.sqrt(sumSq / D));
        const p2 = -Math.exp(sumCos / D);
        return p1 + p2 + 20 + Math.E;
      }
    }
  };

  window.MetaOpt.BENCHMARKS = BENCHMARKS;
})();

