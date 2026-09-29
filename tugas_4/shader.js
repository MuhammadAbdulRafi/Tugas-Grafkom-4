'use strict';

// Kode Vertex Shader dalam bentuk string
const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    attribute vec3 aVertexNormal;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform mat4 uNormalMatrix;

    varying lowp vec4 vColor;
    varying highp vec3 vTransformedNormal;
    varying highp vec3 vPosition;

    void main(void) {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        
        // Transformasi vertex dan normal ke 'view space' untuk diteruskan ke Fragment Shader
        vPosition = (uModelViewMatrix * aVertexPosition).xyz;
        vTransformedNormal = (uNormalMatrix * vec4(aVertexNormal, 1.0)).xyz;
        vColor = aVertexColor;
    }
`;

// Kode Fragment Shader dalam bentuk string
const fsSource = `
    precision mediump float;

    varying lowp vec4 vColor;
    varying highp vec3 vTransformedNormal;
    varying highp vec3 vPosition;

    uniform vec3 uLightPosition;
    uniform vec3 uCameraPosition;

    uniform vec3 uAmbientColor;
    uniform vec3 uDiffuseColor;
    uniform vec3 uSpecularColor;

    void main(void) {
        // 1. Normalisasi vektor normal
        vec3 normal = normalize(vTransformedNormal);

        // 2. Kalkulasi Ambient
        vec3 ambient = uAmbientColor;

        // 3. Kalkulasi Diffuse
        vec3 lightDirection = normalize(uLightPosition - vPosition);
        float diff = max(dot(normal, lightDirection), 0.0);
        vec3 diffuse = uDiffuseColor * diff;

        // 4. Kalkulasi Specular
        vec3 viewDirection = normalize(uCameraPosition - vPosition);
        vec3 reflectDirection = reflect(-lightDirection, normal);
        float spec = pow(max(dot(viewDirection, reflectDirection), 0.0), 90.0); // 32.0 adalah shininess
        vec3 specular = uSpecularColor * spec;

        // 5. Gabungkan semua komponen lighting
        vec3 lightingResult = ambient + diffuse + specular;

        // Final color: warna objek * hasil lighting
        gl_FragColor = vec4(vColor.rgb * lightingResult, vColor.a);
    }
`;

// Fungsi helper untuk menginisialisasi program shader
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Gagal menginisialisasi shader: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    return shaderProgram;
}

// Fungsi helper untuk memuat (mengompilasi) satu shader
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('Error kompilasi shader: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}