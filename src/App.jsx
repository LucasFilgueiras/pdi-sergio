import { getPixels } from "ndarray-pixels";
import ndarray from "ndarray";
import { getImgFromArr } from "array-to-image";
import { useRef, useState } from "react";
import "./App.css";
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Chart.js Bar Chart',
    },
  },
};

function App() {
  const [action, setAction] = useState("");
  const [image, setImages] = useState(null);
  const [imageResult, setImageResult] = useState(null);
  //const [grayLevel, setGrayLevel] = useState(0);
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  const [gamma, setGamma] = useState(0);
  const [mask, setMask] = useState(3);
  const [aAndB, setAAndB] = useState({
    a: 0,
    b: 0
  })
  const [porcentagemSomar, setPorcentagemSomar] = useState(0);
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const imageBRef = useRef(null);

  const countOccurrences = async (search) => {
    const result = await fetch(image[0]);
    const pixels = await getImagePixels(result);

    return pixels.data.reduce((count, array) => {
        for (let i = 0; i < array.length; i++) {
            if (array[i] === search) {
                count++;
            }
        }

        return count;
    }, 0);
  }

  let labels = new Array(256);

  for (let i = 0; i < labels.length; i++) {
    labels[i] = i;
  }

  const data = {
    labels,
    datasets: [
      {
        label: 'Dataset 1',
        data: labels.map(index => countOccurrences(index)),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  const filterOptions = [
    "negativo",
    "log",
    "log inverso",
    "potência",
    "raiz",
    "ampliacaoBilinear512",
    "ampliacaoBilinear1024",
    "ampliacaoPorPixel512",
    "ampliacaoPorPixel1024",
    "histograma",
    "espelhamentoHorizontal",
    "espelhamentoVertical",
    "rotacao90Horario",
    "rotacao90AntiHorario",
    "rotacao180",
    "expansao",
    "compressao",
    "somarImagens",
    "media",
    "moda",
    "mediana",
    "min",
    "max",
    "operadorLaplaciano",
    "operadorHighBoost",
    "operadorPrewitt",
    "operadorSobel",
  ];

  const convertRGBToGrayScale = (r, g, b) => {
    const gray = (r + g + b) / 3;

    return gray;
  };
  //a

  const getImagePixels = async (imageData) => {
    const bytesIn = await fetch(imageData)
      .then((res) => res.arrayBuffer())
      .then((arrayBuffer) => new Uint8Array(arrayBuffer));
    const pixels = await getPixels(bytesIn, "image/png");

    return pixels;
  };

  const pontaDeProva = async (e) => {
    const result = await fetch(image[0]) // Certifique-se de que image[0] seja uma URL válida da imagem
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "imageResult.bmp", {
          type: "image/bmp",
        });

        return URL.createObjectURL(file);
      });
    const pixels = await getImagePixels(result); // Implemente a função getImagePixels para obter os pixels da imagem
      console.log(pixels.data)
    const x = e.pageX - e.target.offsetLeft;
    const y = e.pageY - e.target.offsetTop;

    console.log(pixels.get(x - 1, y - 1, 0))
    console.log(pixels.get(x, y - 1, 0))
    console.log(pixels.get(x + 1, y - 1, 0))
    console.log("----------")
    console.log(pixels.get(x - 1, y, 0))
    console.log(pixels.get(x, y, 0))
    console.log(pixels.get(x + 1, y, 0))
    console.log("----------")
    console.log(pixels.get(x - 1, y + 1, 0))
    console.log(pixels.get(x, y + 1, 0))
    console.log(pixels.get(x + 1, y + 1, 0))

    const gray = convertRGBToGrayScale(
      pixels.get(x, y, 0),
      pixels.get(x, y, 1),
      pixels.get(x, y, 2)
    );

    if (imageResult != null) {
      pontaDeProva2(x, y, pixels);
    }

    setA(gray);
    setCoordinates({ x: x, y: y });
  };

  const pontaDeProva2 = async (x, y) => {
    const result = await fetch(imageResult?.src)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "imageResult.bmp", {
          type: "image/bmp",
        });

        return URL.createObjectURL(file);
      });
    const pixels = await getImagePixels(result);
  
    const gray = convertRGBToGrayScale(
      pixels.get(x, y, 0),
      pixels.get(x, y, 1),
      pixels.get(x, y, 2)
    )

    setB(gray);
  };

  const negativo = async () => {
    const pixels = await getImagePixels(image[0]);
    const [width, height] = pixels.shape;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const gray = convertRGBToGrayScale(
          pixels.get(x, y, 0),
          pixels.get(x, y, 1),
          pixels.get(x, y, 2)
        );
        pixels.set(x, y, 0, 255 - gray);
        pixels.set(x, y, 1, 255 - gray);
        pixels.set(x, y, 2, 255 - gray);
      }
    }

    const img = getImgFromArr(pixels.data);

    setImageResult(img);
  };

  const calcLog = async () => {
    const pixels = await getImagePixels(image[0]);
    const [width, height] = pixels.shape;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const gray = convertRGBToGrayScale(
          pixels.get(x, y, 0),
          pixels.get(x, y, 1),
          pixels.get(x, y, 2)
        );

        const log = 105.8864 * Math.log(1 + gray);

        pixels.set(x, y, 0, log);
        pixels.set(x, y, 1, log);
        pixels.set(x, y, 2, log);
      }
    }

    const img = getImgFromArr(pixels.data);

    setImageResult(img);
  };

  const calcInverseLog = async () => {
    const pixels = await getImagePixels(image[0]);
    const [width, height] = pixels.shape;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const gray = convertRGBToGrayScale(
          pixels.get(x, y, 0),
          pixels.get(x, y, 1),
          pixels.get(x, y, 2)
        );

        const log = Math.pow(10, gray / 105.8864);

        pixels.set(x, y, 0, log);
        pixels.set(x, y, 1, log);
        pixels.set(x, y, 2, log);
      }
    }

    const img = getImgFromArr(pixels.data);

    setImageResult(img);
  };

  const potencia = async () => {
    const pixels = await getImagePixels(image[0]);
    const [width, height] = pixels.shape;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const gray = convertRGBToGrayScale(
          pixels.get(x, y, 0),
          pixels.get(x, y, 1),
          pixels.get(x, y, 2)
        );

        const proporcao = gray / 255;
        const potencia = Math.pow(proporcao, 1 / gamma) * 256;

        pixels.set(x, y, 0, potencia);
        pixels.set(x, y, 1, potencia);
        pixels.set(x, y, 2, potencia);
      }
    }

    const img = getImgFromArr(pixels.data);

    setImageResult(img);
  };

  const raiz = async () => {
    const pixels = await getImagePixels(image[0]);
    const [width, height] = pixels.shape;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const gray = convertRGBToGrayScale(
          pixels.get(x, y, 0),
          pixels.get(x, y, 1),
          pixels.get(x, y, 2)
        );

        const proporcao = gray / 255;
        const resultado = Math.pow(proporcao, gamma) * 256;

        pixels.set(x, y, 0, resultado);
        pixels.set(x, y, 1, resultado);
        pixels.set(x, y, 2, resultado);
      }
    }

    const img = getImgFromArr(pixels.data);

    setImageResult(img);
  };

  const ampliacaoBilinear = async (value) => {
    const pixels = await getImagePixels(image[0]);

    const novaLargura = value;
    const novaAltura = value;

    const imagemAmpliada = ndarray(
      new Float32Array(novaLargura * novaAltura * 4),
      [novaLargura, novaAltura, 4]
    );

    const escalaX = novaLargura / pixels.shape[0];
    const escalaY = novaAltura / pixels.shape[1];

    for (let x = 0; x < novaLargura; x++) {
      for (let y = 0; y < novaAltura; y++) {
        const x_original = x / escalaX;
        const y_original = y / escalaY;

        const x0 = Math.floor(x_original);
        const x1 = Math.min(x0 + 1, pixels.shape[0] - 1);
        const y0 = Math.floor(y_original);
        const y1 = Math.min(y0 + 1, pixels.shape[1] - 1);

        const dx = x_original - x0;
        const dy = y_original - y0;

        for (let c = 0; c < 4; c++) {
          const valor =
            (1 - dx) * (1 - dy) * pixels.get(x0, y0, c) +
            dx * (1 - dy) * pixels.get(x1, y0, c) +
            (1 - dx) * dy * pixels.get(x0, y1, c) +
            dx * dy * pixels.get(x1, y1, c);

          imagemAmpliada.set(y, x, c, valor);
        }
      }
    }

    const img = getImgFromArr(imagemAmpliada.data);

    setImageResult(img);
  };

  const ampliacaoPorPixel = async (value) => {
    const pixels = await getImagePixels(image[0]);

    const novaLargura = value;
    const novaAltura = value;

    const imagemAmpliada = ndarray(
      new Float32Array(novaLargura * novaAltura * 4),
      [novaLargura, novaAltura, 4]
    );

    const replicacaoX = novaLargura / pixels.shape[0];
    const replicacaoY = novaAltura / pixels.shape[1];

    for (let y = 0; y < novaAltura; y++) {
      for (let x = 0; x < novaLargura; x++) {
        const x_original = Math.floor(x / replicacaoX);
        const y_original = Math.floor(y / replicacaoY);

        for (let c = 0; c < 4; c++) {
          const valor = pixels.get(x_original, y_original, c);
          imagemAmpliada.set(y, x, c, valor);
        }
      }
    }

    const img = getImgFromArr(imagemAmpliada.data);

    setImageResult(img);
  };

  const histograma = async () => {
    const pixels = await getImagePixels(image[0]);

    const histograma = ndarray(new Uint32Array(256), [256]);

    // Percorra os pixels da imagem e conte a frequência de cada valor de intensidade
    for (let x = 0; x < pixels.shape[0]; x++) {
      for (let y = 0; y < pixels.shape[1]; y++) {
        const intensidade = Math.floor(pixels.get(x, y) * 255);
        histograma.set(intensidade, histograma.get(intensidade) + 1);
      }
    }

    // Encontre a intensidade máxima no histograma para normalização
    const maxIntensidade = Math.max(...histograma.data);

    // Crie uma nova imagem representando o histograma
    const histogramaImgData = new Uint8ClampedArray(256 * 100 * 4); // Altura fixa em 100 para melhor visualização

    for (let i = 0; i < 256; i++) {
      const altura = Math.floor((histograma.get(i) / maxIntensidade) * 100);
      for (let j = 0; j < 100; j++) {
        if (j < altura) {
          const index = i * 4 * 100 + j * 4;
          histogramaImgData.set([i, i, i, 255], index); // Define os valores de R, G, B e A
        }
      }
    }

    const histogramaImg = new ImageData(histogramaImgData, 256, 100);
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 100;
    const ctx = canvas.getContext("2d");
    ctx.putImageData(histogramaImg, 0, 0);

    const img = new Image();
    img.src = canvas.toDataURL();
    setImageResult(img);
  };

  const espelhamentoHorizontal = async () => {
    const pixels = await getImagePixels(image[0]);

    const largura = pixels.shape[0];
    const altura = pixels.shape[1];

    let resultado = [];

    for (let y = 0; y < altura; y++) {
      for (let x = 0; x < largura; x++) {
        const original = (y * largura + x) * 4;
        const espelhado = ((y + 1) * largura - x - 1) * 4;

        for (let i = 0; i < 4; i++) {
          resultado[espelhado + i] = pixels.data[original + i];
        }
      }
    }

    const img = getImgFromArr(resultado);

    setImageResult(img);
  };

  const espelhamentoVertical = async () => {
    const pixels = await getImagePixels(image[0]);

    const largura = pixels.shape[0];
    const altura = pixels.shape[1];

    let resultado = [];

    for (let y = 0; y < altura; y++) {
      for (let x = 0; x < largura; x++) {
        const original = (y * largura + x) * 4;
        const espelhado = ((altura - y - 1) * largura + x) * 4;

        for (let i = 0; i < 4; i++) {
          resultado[espelhado + i] = pixels.data[original + i];
        }
      }
    }

    const img = getImgFromArr(resultado);

    setImageResult(img);
  };

  const rotacao90AntiHorario = async () => {
    const pixels = await getImagePixels(image[0]);

    const largura = pixels.shape[0];
    const altura = pixels.shape[1];

    const imagemRotacionadaHorario = ndarray(
      new Uint8Array(largura * altura * 4),
      [largura, altura, 4]
    );

    for (let y = 0; y < altura; y++) {
      for (let x = 0; x < largura; x++) {
        const pixel = pixels.get(y, x, 0);
        imagemRotacionadaHorario.set(altura - y, x, 0, pixel);
        imagemRotacionadaHorario.set(altura - y, x, 1, pixel);
        imagemRotacionadaHorario.set(altura - y, x, 2, pixel);
        imagemRotacionadaHorario.set(altura - y, x, 3, 255);
      }
    }

    const img = getImgFromArr(imagemRotacionadaHorario.data);

    setImageResult(img);
  };

  const rotacao90Horario = async () => {
    const pixels = await getImagePixels(image[0]);

    const largura = pixels.shape[0];
    const altura = pixels.shape[1];

    const imagemRotacionadaHorario = ndarray(
      new Uint8Array(largura * altura * 4),
      [largura, altura, 4]
    );

    for (let y = 0; y < altura; y++) {
      for (let x = 0; x < largura; x++) {
        const pixel = pixels.get(y, x, 0);
        imagemRotacionadaHorario.set(y, altura - x, 0, pixel);
        imagemRotacionadaHorario.set(y, altura - x, 1, pixel);
        imagemRotacionadaHorario.set(y, altura - x, 2, pixel);
        imagemRotacionadaHorario.set(y, altura - x, 3, 255);
      }
    }

    const img = getImgFromArr(imagemRotacionadaHorario.data);

    setImageResult(img);
  };

  const rotacao180 = async () => {
    const pixels = await getImagePixels(image[0]);

    const largura = pixels.shape[0];
    const altura = pixels.shape[1];

    const imagemRotacionadaHorario = ndarray(
      new Uint8Array(largura * altura * 4),
      [largura, altura, 4]
    );

    for (let y = 0; y < altura; y++) {
      for (let x = 0; x < largura; x++) {
        const pixel = pixels.get(y, x, 0);
        imagemRotacionadaHorario.set(largura - x, altura - y, 0, pixel);
        imagemRotacionadaHorario.set(largura - x, altura - y, 1, pixel);
        imagemRotacionadaHorario.set(largura - x, altura - y, 2, pixel);
        imagemRotacionadaHorario.set(largura - x, altura - y, 3, 255);
      }
    }

    const img = getImgFromArr(imagemRotacionadaHorario.data);

    setImageResult(img);
  };

  const expansao = async () => {
    const pixels = await getImagePixels(image[0]);

    const largura = pixels.shape[1];
    const altura = pixels.shape[0];

    for (let x = 0; x < largura; x++) {
      for (let y = 0; y < altura; y++) {
        const novoR = aAndB.a * pixels.get(x, y, 0) + aAndB.b;
        const novoG = aAndB.a * pixels.get(x, y, 1) + aAndB.b;
        const novoB = aAndB.a * pixels.get(x, y, 2) + aAndB.b;
        const novoA = pixels.get(x, y, 3);

        pixels.set(x, y, 0, novoR);
        pixels.set(x, y, 1, novoG);
        pixels.set(x, y, 2, novoB);
        pixels.set(x, y, 3, novoA);
      }
    }

    const img = getImgFromArr(pixels.data);

    setImageResult(img);
  };

  const compressao = async () => {
    const pixels = await getImagePixels(image[0]);

    const largura = pixels.shape[1];
    const altura = pixels.shape[0];

    for (let x = 0; x < largura; x++) {
      for (let y = 0; y < altura; y++) {
        const novoR = pixels.get(x, y, 0) / (aAndB.a - aAndB.b);
        const novoG = pixels.get(x, y, 1) / (aAndB.a - aAndB.b);
        const novoB = pixels.get(x, y, 2) / (aAndB.a - aAndB.b);
        const novoA = pixels.get(x, y, 3);

        pixels.set(x, y, 0, novoR);
        pixels.set(x, y, 1, novoG);
        pixels.set(x, y, 2, novoB);
        pixels.set(x, y, 3, novoA);
      }
    }

    const img = getImgFromArr(pixels.data);

    setImageResult(img);
  };

  const somarImagens = async () => {
    const pixels = await getImagePixels(image[0]);
    const pixels2 = await getImagePixels(image[1]);

    const largura = pixels.shape[1];
    const altura = pixels.shape[0];

    const imagemSoma = ndarray(new Float32Array(largura * altura * 4), [
      largura,
      altura,
      4,
    ]);

    for (let x = 0; x < largura; x++) {
      for (let y = 0; y < altura; y++) {

        const percentage = porcentagemSomar / 100
        // Aplica a soma ponderada dos pixels com as porcentagens
        const novoR =
          percentage * pixels.get(y, x, 0) +
          (1 - percentage) * pixels2.get(y, x, 0);
        const novoG =
          percentage * pixels.get(y, x, 1) +
          (1 - percentage) * pixels2.get(y, x, 1);
        const novoB =
          percentage * pixels.get(y, x, 2) +
          (1 - percentage) * pixels2.get(y, x, 2);
        const novoA = pixels.get(x, y, 3); // Mantém o canal alfa inalterado
        // Define o novo valor do pixel na imagem de soma
        imagemSoma.set(x, y, 0, novoR);
        imagemSoma.set(x, y, 1, novoG);
        imagemSoma.set(x, y, 2, novoB);
        imagemSoma.set(x, y, 3, novoA);
      }
    }

    const img = getImgFromArr(imagemSoma.data);

    setImageResult(img);
  };

  const media = async () => {
    const pixels = await getImagePixels(image[0]);
    const radius = Math.floor(mask / 2);

    const largura = pixels.shape[1];
    const altura = pixels.shape[0];

    const imagemFiltrada = ndarray(new Float32Array(largura * altura * 4), [
      altura,
      largura,
      4,
    ]); // Trocando altura e largura aqui

    for (let y = 0; y < altura; y++) {
      // Trocando x e y nos loops
      for (let x = 0; x < largura; x++) {
        // Trocando x e y nos loops
        let somaR = 0;
        let somaG = 0;
        let somaB = 0;

        for (let dx = -radius; dx <= radius; dx++) {
          for (let dy = -radius; dy <= radius; dy++) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && nx < largura && ny >= 0 && ny < altura) {
              somaR += pixels.get(nx, ny, 0); // Trocando x e y aqui
              somaG += pixels.get(nx, ny, 1); // Trocando x e y aqui
              somaB += pixels.get(nx, ny, 2); // Trocando x e y aqui
            }
          }
        }

        const numPixelsNaMascara = (2 * radius + 1) ** 2;
        const novoR = somaR / numPixelsNaMascara;
        const novoG = somaG / numPixelsNaMascara;
        const novoB = somaB / numPixelsNaMascara;
        const novoA = pixels.get(x, y, 3);

        imagemFiltrada.set(y, x, 0, novoR); // Trocando x e y aqui
        imagemFiltrada.set(y, x, 1, novoG); // Trocando x e y aqui
        imagemFiltrada.set(y, x, 2, novoB); // Trocando x e y aqui
        imagemFiltrada.set(y, x, 3, novoA);
      }
    }

    const img = getImgFromArr(imagemFiltrada.data);

    setImageResult(img);
  };

  const moda = async () => {
    const pixels = await getImagePixels(image[0]);

    const radius = Math.floor(mask / 2);

    const largura = pixels.shape[1];
    const altura = pixels.shape[0];

    const imagemFiltrada = ndarray(new Float32Array(largura * altura * 4), [
      altura,
      largura,
      4,
    ]);

    for (let y = 0; y < altura; y++) {
      for (let x = 0; x < largura; x++) {
        const pixelCounts = {}; // Contador para contagem de valores de pixel

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && nx < largura && ny >= 0 && ny < altura) {
              const pixelValue = pixels.get(nx, ny, 0); // Obtém o valor do pixel na vizinhança

              // Atualiza o contador para o valor do pixel
              if (pixelCounts[pixelValue]) {
                pixelCounts[pixelValue]++;
              } else {
                pixelCounts[pixelValue] = 1;
              }
            }
          }
        }

        // Encontra o valor do pixel mais comum
        let modaValue = null;
        let modaCount = 0;
        for (const value in pixelCounts) {
          if (pixelCounts[value] > modaCount) {
            modaValue = value;
            modaCount = pixelCounts[value];
          }
        }

        // Define o valor da moda como o valor do pixel na imagem filtrada
        const novoR = modaValue;
        const novoG = modaValue;
        const novoB = modaValue;
        const novoA = pixels.get(y, x, 3);

        imagemFiltrada.set(y, x, 0, novoR);
        imagemFiltrada.set(y, x, 1, novoG);
        imagemFiltrada.set(y, x, 2, novoB);
        imagemFiltrada.set(y, x, 3, novoA);
      }
    }

    const img = getImgFromArr(imagemFiltrada.data);

    setImageResult(img);
  };

  const mediana = async () => {
    const pixels = await getImagePixels(image[0]);

    const radius = Math.floor(mask / 2);

    const largura = pixels.shape[1];
    const altura = pixels.shape[0];

    const imagemFiltrada = ndarray(new Float32Array(largura * altura * 4), [
      altura,
      largura,
      4,
    ]);

    for (let y = 0; y < altura; y++) {
      for (let x = 0; x < largura; x++) {
        const pixelValues = []; // Array para armazenar os valores de pixel na vizinhança

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && nx < largura && ny >= 0 && ny < altura) {
              const pixelValue = pixels.get(nx, ny, 0); // Obtém o valor do pixel na vizinhança
              pixelValues.push(pixelValue);
            }
          }
        }

        // Classifica os valores de pixel
        pixelValues.sort((a, b) => a - b);

        // Encontra o valor da mediana
        const meio = Math.floor(pixelValues.length / 2);
        const medianaValue = pixelValues[meio];

        // Define o valor da mediana como o valor do pixel na imagem filtrada
        const novoR = medianaValue;
        const novoG = medianaValue;
        const novoB = medianaValue;
        const novoA = pixels.get(y, x, 3);

        imagemFiltrada.set(y, x, 0, novoR);
        imagemFiltrada.set(y, x, 1, novoG);
        imagemFiltrada.set(y, x, 2, novoB);
        imagemFiltrada.set(y, x, 3, novoA);
      }
    }

    const img = getImgFromArr(imagemFiltrada.data);

    setImageResult(img);
  };

  const min = async () => {
    const pixels = await getImagePixels(image[0]);

    const radius = Math.floor(mask / 2);

    const largura = pixels.shape[1];
    const altura = pixels.shape[0];

    const imagemFiltrada = ndarray(new Float32Array(largura * altura * 4), [
      altura,
      largura,
      4,
    ]);

    for (let y = 0; y < altura; y++) {
      for (let x = 0; x < largura; x++) {
        const pixelValues = []; // Array para armazenar os valores de pixel na vizinhança

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && nx < largura && ny >= 0 && ny < altura) {
              const pixelValue = pixels.get(nx, ny, 0); // Obtém o valor do pixel na vizinhança
              pixelValues.push(pixelValue);
            }
          }
        }

        // Encontra o valor mínimo entre os valores de pixel
        const minimoValue = Math.min(...pixelValues);

        // Define o valor mínimo como o valor do pixel na imagem filtrada
        const novoR = minimoValue;
        const novoG = minimoValue;
        const novoB = minimoValue;
        const novoA = pixels.get(y, x, 3);

        imagemFiltrada.set(y, x, 0, novoR);
        imagemFiltrada.set(y, x, 1, novoG);
        imagemFiltrada.set(y, x, 2, novoB);
        imagemFiltrada.set(y, x, 3, novoA);
      }
    }

    const img = getImgFromArr(imagemFiltrada.data);

    setImageResult(img);
  };

  const max = async () => {
    const pixels = await getImagePixels(image[0]);

    const radius = Math.floor(mask / 2);

    const largura = pixels.shape[1];
    const altura = pixels.shape[0];

    const imagemFiltrada = ndarray(new Float32Array(largura * altura * 4), [
      altura,
      largura,
      4,
    ]);

    for (let y = 0; y < altura; y++) {
      for (let x = 0; x < largura; x++) {
        const pixelValues = []; // Array para armazenar os valores de pixel na vizinhança

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && nx < largura && ny >= 0 && ny < altura) {
              const pixelValue = pixels.get(nx, ny, 0); // Obtém o valor do pixel na vizinhança
              pixelValues.push(pixelValue);
            }
          }
        }

        // Encontra o valor máximo entre os valores de pixel
        const maximoValue = Math.max(...pixelValues);

        // Define o valor máximo como o valor do pixel na imagem filtrada
        const novoR = maximoValue;
        const novoG = maximoValue;
        const novoB = maximoValue;
        const novoA = pixels.get(y, x, 3);

        imagemFiltrada.set(y, x, 0, novoR);
        imagemFiltrada.set(y, x, 1, novoG);
        imagemFiltrada.set(y, x, 2, novoB);
        imagemFiltrada.set(y, x, 3, novoA);
      }
    }

    const img = getImgFromArr(imagemFiltrada.data);

    setImageResult(img);
  };

  const operadorLaplaciano = async () => {
    const pixels = await getImagePixels(image[0]);

    const largura = pixels.shape[1];
    const altura = pixels.shape[0];

    const imagemFiltrada = ndarray(new Float32Array(largura * altura * 4), [
      altura,
      largura,
      4,
    ]);

    const laplaciano = [
      [0, 1, 0],
      [1, -4, 1],
      [0, 1, 0],
    ];

    const radius = Math.floor(laplaciano.length / 2);

    for (let y = 0; y < altura; y++) {
      for (let x = 0; x < largura; x++) {
        let somaR = 0;
        let somaG = 0;
        let somaB = 0;

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && nx < largura && ny >= 0 && ny < altura) {
              const valorLaplaciano = laplaciano[dy + radius][dx + radius];
              somaR += valorLaplaciano * pixels.get(nx, ny, 0);
              somaG += valorLaplaciano * pixels.get(nx, ny, 1);
              somaB += valorLaplaciano * pixels.get(nx, ny, 2);
            }
          }
        }

        const novoR = pixels.get(x, y, 0) - somaR;
        const novoG = pixels.get(x, y, 1) - somaG;
        const novoB = pixels.get(x, y, 2) - somaB;
        const novoA = pixels.get(x, y, 3);

        imagemFiltrada.set(y, x, 0, novoR);
        imagemFiltrada.set(y, x, 1, novoG);
        imagemFiltrada.set(y, x, 2, novoB);
        imagemFiltrada.set(y, x, 3, novoA);
      }
    }

    const img = getImgFromArr(imagemFiltrada.data);

    setImageResult(img);
  };

  const operadorHighBoost = async (k) => {
    const pixels = await getImagePixels(image[0]);

    const largura = pixels.shape[1];
    const altura = pixels.shape[0];

    const imagemFiltrada = ndarray(new Float32Array(largura * altura * 4), [
      altura,
      largura,
      4,
    ]);

    const filtroPassaAlta = [
      [-1, -1, -1],
      [-1, 9, -1],
      [-1, -1, -1],
    ];

    const radius = Math.floor(filtroPassaAlta.length / 2);

    for (let y = 0; y < altura; y++) {
      for (let x = 0; x < largura; x++) {
        let somaR = 0;
        let somaG = 0;
        let somaB = 0;

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && nx < largura && ny >= 0 && ny < altura) {
              const valorFiltroPassaAlta =
                filtroPassaAlta[dy + radius][dx + radius];
              somaR += valorFiltroPassaAlta * pixels.get(nx, ny, 0);
              somaG += valorFiltroPassaAlta * pixels.get(nx, ny, 1);
              somaB += valorFiltroPassaAlta * pixels.get(nx, ny, 2);
            }
          }
        }

        const novoR = pixels.get(x, y, 0) + k * somaR;
        const novoG = pixels.get(x, y, 1) + k * somaG;
        const novoB = pixels.get(x, y, 2) + k * somaB;
        const novoA = pixels.get(x, y, 3);

        imagemFiltrada.set(y, x, 0, novoR);
        imagemFiltrada.set(y, x, 1, novoG);
        imagemFiltrada.set(y, x, 2, novoB);
        imagemFiltrada.set(y, x, 3, novoA);
      }
    }

    const img = getImgFromArr(imagemFiltrada.data);

    setImageResult(img);
  };

  const operadorPrewitt = async () => {
    const pixels = await getImagePixels(image[0]);

    const largura = pixels.shape[1];
    const altura = pixels.shape[0];

    const imagemFiltrada = ndarray(new Float32Array(largura * altura * 4), [
      altura,
      largura,
      4,
    ]);

    const filtroPrewittHorizontal = [
      [-1, 0, 1],
      [-1, 0, 1],
      [-1, 0, 1],
    ];

    const filtroPrewittVertical = [
      [-1, -1, -1],
      [0, 0, 0],
      [1, 1, 1],
    ];

    const radius = Math.floor(filtroPrewittHorizontal.length / 2);

    for (let y = 0; y < altura; y++) {
      for (let x = 0; x < largura; x++) {
        let somaRHorizontal = 0;
        let somaGHorizontal = 0;
        let somaBHorizontal = 0;

        let somaRVertical = 0;
        let somaGVertical = 0;
        let somaBVertical = 0;

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && nx < largura && ny >= 0 && ny < altura) {
              const valorHorizontal =
                filtroPrewittHorizontal[dy + radius][dx + radius];
              const valorVertical =
                filtroPrewittVertical[dy + radius][dx + radius];

              somaRHorizontal += valorHorizontal * pixels.get(nx, ny, 0);
              somaGHorizontal += valorHorizontal * pixels.get(nx, ny, 1);
              somaBHorizontal += valorHorizontal * pixels.get(nx, ny, 2);

              somaRVertical += valorVertical * pixels.get(nx, ny, 0);
              somaGVertical += valorVertical * pixels.get(nx, ny, 1);
              somaBVertical += valorVertical * pixels.get(nx, ny, 2);
            }
          }
        }

        const novoR = Math.sqrt(somaRHorizontal ** 2 + somaRVertical ** 2);
        const novoG = Math.sqrt(somaGHorizontal ** 2 + somaGVertical ** 2);
        const novoB = Math.sqrt(somaBHorizontal ** 2 + somaBVertical ** 2);
        const novoA = pixels.get(y, x, 3);

        imagemFiltrada.set(y, x, 0, novoR);
        imagemFiltrada.set(y, x, 1, novoG);
        imagemFiltrada.set(y, x, 2, novoB);
        imagemFiltrada.set(y, x, 3, novoA);
      }
    }

    const img = getImgFromArr(imagemFiltrada.data);

    setImageResult(img);
  };

  const operadorSobel = async () => {
    const pixels = await getImagePixels(image[0]);

    const largura = pixels.shape[1];
    const altura = pixels.shape[0];

    const imagemFiltrada = ndarray(new Float32Array(largura * altura * 4), [
      altura,
      largura,
      4,
    ]);

    const filtroSobelHorizontal = [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1],
    ];

    const filtroSobelVertical = [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1],
    ];

    const radius = Math.floor(filtroSobelHorizontal.length / 2);

    for (let y = 0; y < altura; y++) {
      for (let x = 0; x < largura; x++) {
        let somaRHorizontal = 0;
        let somaGHorizontal = 0;
        let somaBHorizontal = 0;

        let somaRVertical = 0;
        let somaGVertical = 0;
        let somaBVertical = 0;

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && nx < largura && ny >= 0 && ny < altura) {
              const valorHorizontal =
                filtroSobelHorizontal[dy + radius][dx + radius];
              const valorVertical =
                filtroSobelVertical[dy + radius][dx + radius];

              somaRHorizontal += valorHorizontal * pixels.get(ny, nx, 0);
              somaGHorizontal += valorHorizontal * pixels.get(ny, nx, 1);
              somaBHorizontal += valorHorizontal * pixels.get(ny, nx, 2);

              somaRVertical += valorVertical * pixels.get(ny, nx, 0);
              somaGVertical += valorVertical * pixels.get(ny, nx, 1);
              somaBVertical += valorVertical * pixels.get(ny, nx, 2);
            }
          }
        }

        const novoR = Math.sqrt(somaRHorizontal ** 2 + somaRVertical ** 2);
        const novoG = Math.sqrt(somaGHorizontal ** 2 + somaGVertical ** 2);
        const novoB = Math.sqrt(somaBHorizontal ** 2 + somaBVertical ** 2);
        const novoA = pixels.get(y, x, 3);

        imagemFiltrada.set(x, y, 0, novoR);
        imagemFiltrada.set(x, y, 1, novoG);
        imagemFiltrada.set(x, y, 2, novoB);
        imagemFiltrada.set(x, y, 3, novoA);
      }
    }

    const img = getImgFromArr(imagemFiltrada.data);

    setImageResult(img);
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    const parsedFiles = files.map((file) => {
      return URL.createObjectURL(file);
    });
    files.length <= 2 && setImages(parsedFiles);
  };

  const executeAction = async (e) => {
    switch (action) {
      case "ponta de prova":
        await pontaDeProva(e);
        break;
      case "negativo":
        await negativo();
        break;
      case "log":
        await calcLog();
        break;
      case "potência":
        await potencia();
        break;
      case "raiz":
        await raiz();
        break;
      case "ampliacaoBilinear512":
        await ampliacaoBilinear(512);
        break;
      case "ampliacaoBilinear1024":
        await ampliacaoBilinear(1024);
        break;
      case "ampliacaoPorPixel512":
        await ampliacaoPorPixel(512);
        break;
      case "ampliacaoPorPixel1024":
        await ampliacaoPorPixel(1024);
        break;
      case "histograma":
        await histograma();
        break;
      case "espelhamentoHorizontal":
        await espelhamentoHorizontal();
        break;
      case "espelhamentoVertical":
        await espelhamentoVertical();
        break;
      case "rotacao90Horario":
        await rotacao90Horario();
        break;
      case "rotacao90AntiHorario":
        await rotacao90AntiHorario();
        break;
      case "rotacao180":
        await rotacao180();
        break;
      case "expansao":
        await expansao();
        break;
      case "compressao":
        await compressao();
        break;
      case "somarImagens":
        await somarImagens();
        break;
      case "media":
        await media();
        break;
      case "moda":
        await moda();
        break;
      case "mediana":
        await mediana();
        break;
      case "min":
        await min();
        break;
      case "max":
        await max();
        break;
      case "operadorLaplaciano":
        await operadorLaplaciano();
        break;
      case "operadorHighBoost":
        await operadorHighBoost(1);
        break;
      case "operadorPrewitt":
        await operadorPrewitt();
        break;
      case "operadorSobel":
        await operadorSobel();
        break;
      case "log inverso":
        await calcInverseLog();
        break;
    }
  };

  const handleActionChange = async (e) => {
    setAction(e.target.value);
  };

  const unavailableActionsToExecute = ["ponta de prova"];

  const executeFunctionButtonShouldBeHidden = () => {
    return image == null || unavailableActionsToExecute.includes(action);
  };

  const handleGammaChange = (e) => {
    setGamma(parseFloat(e.target.value));
  };

  return (
    <>
      <h1 className="title">Trabalho PDI</h1>
      <div className="center">
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginLeft: '75px' }}>
          <select value={action} onChange={handleActionChange}>
            <option value={"teste"} label={"Selecionar filtro"} />
            {filterOptions.map((item) => (
              <option key={item} value={item} label={item} />
            ))}
          </select>
          <div>
            <input
              accept="image/*"
              type="file"
              multiple
              onChange={handleImageChange}
            />
          </div>
        </div>
        <div>
          {image != null && (
            <div>
              <div hidden={image == null}>
                <div className="image">
                  <img onClick={(e) => pontaDeProva(e)} src={image[0]}></img>
                  {['somarImagens'].includes(action) && <img src={image[1]}></img>}
                  <img ref={imageBRef} src={imageResult?.src}></img>
                </div>
                <p><b>Nível de cinza entrada: {a}</b></p>
                <p><b>Nível de cinza saída: {b}</b></p>
                <p>
                  <b>Coordenadas: ({coordinates.x}, {coordinates.y})</b>
                </p>
                {['moda', 'media', 'mediana', 'min', 'max'].includes(action) && <input className="input" onChange={(e) => setMask(e.target.value)} type="number" placeholder="Máscara..." />}
                {['potência', 'raiz'].includes(action) && <input className="input" type="number" value={gamma} onChange={handleGammaChange} placeholder="Gamma..." />}
                {['expansao', 'compressao'].includes(action) && (
                  <div>
                    <input className="input" type="number" value={aAndB.a} onChange={(e) => setAAndB({ ...aAndB, a: parseFloat(e.target.value) })} placeholder="Valor de a" />
                    <input className="input" type="number" value={aAndB.b} onChange={(e) => setAAndB({ ...aAndB, b: parseFloat(e.target.value) })} placeholder="Valor de b" />
                  </div>
                )}
                {['somarImagens'].includes(action) && (
                  <div>
                    <input className="input" type="number" value={porcentagemSomar} onChange={(e) => setPorcentagemSomar(e.target.value)} placeholder="Porcentagem..." /> <br />
                    <small>Obs.: selecione duas imagens</small>
                  </div>
                )}
              </div>
            </div>
          )}
          <button
            className="button"
            disabled={gamma < 0 || mask < 3}
            hidden={executeFunctionButtonShouldBeHidden()}
            onClick={executeAction}
          >
            Executar função
          </button>
        </div>
        <Bar options={options} data={data} />
      </div>
    </>
  );
}

export default App;
