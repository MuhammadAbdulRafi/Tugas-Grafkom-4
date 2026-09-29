window.onload = function() {
    'use strict';

    // =================================================================
    // 1. INISIALISASI & SETUP PROGRAM
    // =================================================================
    const canvas = document.getElementById('glCanvas');
    const gl = canvas.getContext('webgl', { antialias: true });

    if (!gl) { alert('WebGL tidak didukung.'); return; }

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
            vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
            // Tambahkan uniform baru untuk lighting
            lightPosition: gl.getUniformLocation(shaderProgram, 'uLightPosition'),
            cameraPosition: gl.getUniformLocation(shaderProgram, 'uCameraPosition'),
            ambientColor: gl.getUniformLocation(shaderProgram, 'uAmbientColor'),
            diffuseColor: gl.getUniformLocation(shaderProgram, 'uDiffuseColor'),
            specularColor: gl.getUniformLocation(shaderProgram, 'uSpecularColor'),
        },
    };

    // =================================================================
    // 2. FUNGSI-FUNGSI BENTUK GEOMETRIS (Tidak ada perubahan)
    // =================================================================
    function createCylinder(r, h, seg, c) { const v=[],i=[],a=(2*Math.PI)/seg;for(let n=0;n<=seg;n++){const t=n*a,e=r*Math.cos(t),s=r*Math.sin(t),o=[e,0,s];v.push(e,-h/2,s,...o,...c),v.push(e,h/2,s,...o,...c)}for(let n=0;n<seg;n++){const r=2*n,t=r+1,e=r+2,s=r+3;i.push(r,t,e,t,s,e)}return{vertices:v,indices:i}}
    function createDisc(r, seg, c) { const v=[],i=[],n=[0,0,1];v.push(0,0,0,...n,...c);const t=(2*Math.PI)/seg;for(let e=0;e<=seg;e++){const s=e*t,o=r*Math.cos(s),a=r*Math.sin(s);v.push(o,a,0,...n,...c)}for(let n=1;n<=seg;n++)i.push(0,n,n+1);return{vertices:v,indices:i}}
    function createCuboid(w, h, d, c) {const t=w/2,e=h/2,s=d/2;const o=[-t,-e,s,0,0,1,...c,t,-e,s,0,0,1,...c,t,e,s,0,0,1,...c,-t,e,s,0,0,1,...c,-t,-e,-s,0,0,-1,...c,-t,e,-s,0,0,-1,...c,t,e,-s,0,0,-1,...c,t,-e,-s,0,0,-1,...c,-t,e,-s,0,1,0,...c,-t,e,s,0,1,0,...c,t,e,s,0,1,0,...c,t,e,-s,0,1,0,...c,-t,-e,-s,0,-1,0,...c,t,-e,-s,0,-1,0,...c,t,-e,s,0,-1,0,...c,-t,-e,s,0,-1,0,...c,t,-e,-s,1,0,0,...c,t,e,-s,1,0,0,...c,t,e,s,1,0,0,...c,t,-e,s,1,0,0,...c,-t,-e,-s,-1,0,0,...c,-t,-e,s,-1,0,0,...c,-t,e,s,-1,0,0,...c,-t,e,-s,-1,0,0,...c],a=[0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23];return{vertices:o,indices:a}}
    function createPerfectP(c){const v=[],i=[],d=.01,n=[0,0,1],t=[[-.2,-.3],[-.2,.35],[-.15,.4],[0,.45],[.18,.35],[.22,.2],[.18,.05],[-.1,.0],[-.1,-.3],[0,.05],[.12,.15],[0,.3]];for(const e of t)v.push(e[0],e[1],d/2,...n,...c);return i.push(0,8,1,1,8,7,1,7,11,7,8,9,11,7,2,2,3,4,4,5,6,6,7,9,9,10,6,10,5,4,10,11,4),{vertices:v,indices:i}}

    // =================================================================
    // 3. PERAKITAN OBJEK (Tidak ada perubahan)
    // =================================================================
    let allVertices = [], allIndices = [];
    function addObject(o,t=[0,0,0],r={angle:0,axis:[0,1,0]}){const e=allVertices.length/10;for(const i of o.indices)allIndices.push(e+i);const a=mat4.create();mat4.fromTranslation(a,t),mat4.rotate(a,a,glMatrix.toRadian(r.angle),r.axis);for(let t=0;t<o.vertices.length;t+=10){const i=[o.vertices[t],o.vertices[t+1],o.vertices[t+2]],n=[o.vertices[t+3],o.vertices[t+4],o.vertices[t+5]],s=[o.vertices[t+6],o.vertices[t+7],o.vertices[t+8],o.vertices[t+9]];vec3.transformMat4(i,i,a);const l=mat4.create();mat4.fromRotation(l,glMatrix.toRadian(r.angle),r.axis),vec3.transformMat4(n,n,l),allVertices.push(...i,...n,...s)}}
    
    addObject(createCylinder(0.05, 2.8, 20, [0.5, 0.5, 0.5, 1.0]), [0, -1.15, 0]);
    addObject(createDisc(0.6, 40, [1.0, 0.0, 0.0, 1.0]), [0, 1.0, 0.0]);
    addObject(createDisc(0.55, 40, [1.0, 1.0, 1.0, 1.0]), [0, 1.0, 0.01]);
    addObject(createCuboid(0.4, 0.15, 0.01, [0.5, 0.5, 0.5, 1.0]), [0, 0.325, 0.05]); 
    addObject(createPerfectP([0.0, 0.0, 0.0, 1.0]), [0, 1.0, 0.02]);
    const slash = createCuboid(0.07, 1.15, 0.01, [1.0, 0.0, 0.0, 1.0]);
    addObject(slash, [0, 1.0, 0.03], { angle: 45, axis: [0, 0, 1] });

    // =================================================================
    // 4. SETUP BUFFERS (Tidak ada perubahan)
    // =================================================================
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(allVertices), gl.STATIC_DRAW);
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(allIndices), gl.STATIC_DRAW);
    
    // =================================================================
    // 5. MENGHUBUNGKAN KONTROL UI
    // =================================================================
    // Fungsi helper untuk konversi warna HEX ke RGB [0-1]
    function hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        return [r, g, b];
    }

    const controls = {
        rotX: document.getElementById('rotX'), rotY: document.getElementById('rotY'), rotZ: document.getElementById('rotZ'),
        camX: document.getElementById('camX'), camY: document.getElementById('camY'), camZ: document.getElementById('camZ'),
        projection: document.querySelectorAll('input[name="projection"]'),
        // Tambahkan kontrol baru
        lightX: document.getElementById('lightX'), lightY: document.getElementById('lightY'), lightZ: document.getElementById('lightZ'),
        ambientColor: document.getElementById('ambientColor'),
        diffuseColor: document.getElementById('diffuseColor'),
        specularColor: document.getElementById('specularColor')
    };
    
    const resetButton = document.getElementById('resetView');
    const autoRotateButton = document.getElementById('autoRotate');

    const defaultTransformState = {
        rotX: 0, rotY: 0, rotZ: 0,
        camX: 0, camY: 1, camZ: 5,
        projectionType: 'perspective'
    };
    
    const defaultLightingState = {
        lightX: 2.0, lightY: 3.0, lightZ: 4.0,
        ambient: hexToRgb('#333333'),
        diffuse: hexToRgb('#FFFFFF'),
        specular: hexToRgb('#FFFFFF')
    };
    
    let transformState = { ...defaultTransformState };
    let lightingState = { ...defaultLightingState };
    let isAutoRotating = false;

    function updateUI() {
        controls.rotX.value = transformState.rotX;
        controls.rotY.value = transformState.rotY;
        controls.rotZ.value = transformState.rotZ;
        controls.camX.value = transformState.camX;
        controls.camY.value = transformState.camY;
        controls.camZ.value = transformState.camZ;
        controls.projection.forEach(r => r.checked = r.value === transformState.projectionType);
        
        controls.lightX.value = lightingState.lightX;
        controls.lightY.value = lightingState.lightY;
        controls.lightZ.value = lightingState.lightZ;
        // Tidak perlu update UI untuk color picker karena sudah otomatis
    }

    // Event listeners untuk kontrol transformasi
    ['rotX', 'rotY', 'rotZ', 'camX', 'camY', 'camZ'].forEach(key => {
        controls[key].addEventListener('input', e => transformState[key] = parseFloat(e.target.value));
    });
    controls.projection.forEach(radio => {
        radio.addEventListener('change', e => transformState.projectionType = e.target.value);
    });

    // Event listeners untuk kontrol lighting
    ['lightX', 'lightY', 'lightZ'].forEach(key => {
        controls[key].addEventListener('input', e => lightingState[key] = parseFloat(e.target.value));
    });
    controls.ambientColor.addEventListener('input', e => lightingState.ambient = hexToRgb(e.target.value));
    controls.diffuseColor.addEventListener('input', e => lightingState.diffuse = hexToRgb(e.target.value));
    controls.specularColor.addEventListener('input', e => lightingState.specular = hexToRgb(e.target.value));

    resetButton.addEventListener('click', () => {
        transformState = { ...defaultTransformState };
        lightingState = { ...defaultLightingState }; // Reset juga lighting
        isAutoRotating = false;
        autoRotateButton.textContent = 'Start Auto Rotate';
        updateUI();
        // Manual update untuk color picker
        controls.ambientColor.value = '#333333';
        controls.diffuseColor.value = '#FFFFFF';
        controls.specularColor.value = '#FFFFFF';
    });

    autoRotateButton.addEventListener('click', () => {
        isAutoRotating = !isAutoRotating;
        autoRotateButton.textContent = isAutoRotating ? 'Stop Auto Rotate' : 'Start Auto Rotate';
    });

    // =================================================================
    // 6. RENDER LOOP UTAMA
    // =================================================================
    function drawScene() {
        if (isAutoRotating) {
            transformState.rotY = (transformState.rotY + 0.5);
            if(transformState.rotY > 180) transformState.rotY -= 360;
            controls.rotY.value = transformState.rotY; // Langsung update UI
        }

        gl.clearColor(0.22, 0.28, 0.36, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const projectionMatrix = mat4.create();
        if (transformState.projectionType === 'perspective') {
            mat4.perspective(projectionMatrix, glMatrix.toRadian(45), gl.canvas.width / gl.canvas.height, 0.1, 100.0);
        } else {
            const orthoHeight = 3;
            const orthoWidth = orthoHeight * (gl.canvas.width / gl.canvas.height);
            mat4.ortho(projectionMatrix, -orthoWidth, orthoWidth, -orthoHeight, orthoHeight, 0.1, 100.0);
        }
        
        const cameraPosition = [transformState.camX, transformState.camY, transformState.camZ];
        const viewMatrix = mat4.create();
        mat4.lookAt(viewMatrix, cameraPosition, [0, 1, 0], [0, 1, 0]);

        const modelMatrix = mat4.create();
        mat4.rotate(modelMatrix, modelMatrix, glMatrix.toRadian(transformState.rotX), [1, 0, 0]);
        mat4.rotate(modelMatrix, modelMatrix, glMatrix.toRadian(transformState.rotY), [0, 1, 0]);
        mat4.rotate(modelMatrix, modelMatrix, glMatrix.toRadian(transformState.rotZ), [0, 0, 1]);

        const modelViewMatrix = mat4.create();
        mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);

        const normalMatrix = mat4.create();
        mat4.invert(normalMatrix, modelViewMatrix);
        mat4.transpose(normalMatrix, normalMatrix);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        const stride = 40; // 10 float * 4 byte
        gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, stride, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexNormal, 3, gl.FLOAT, false, stride, 12);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, stride, 24);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
        
        gl.useProgram(programInfo.program);
        
        // Set uniforms untuk matriks
        gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
        gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, normalMatrix);

        // Set uniforms untuk lighting
        gl.uniform3fv(programInfo.uniformLocations.lightPosition, [lightingState.lightX, lightingState.lightY, lightingState.lightZ]);
        gl.uniform3fv(programInfo.uniformLocations.cameraPosition, cameraPosition);
        gl.uniform3fv(programInfo.uniformLocations.ambientColor, lightingState.ambient);
        gl.uniform3fv(programInfo.uniformLocations.diffuseColor, lightingState.diffuse);
        gl.uniform3fv(programInfo.uniformLocations.specularColor, lightingState.specular);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.drawElements(gl.TRIANGLES, allIndices.length, gl.UNSIGNED_SHORT, 0);

        requestAnimationFrame(drawScene);
    }
    
    requestAnimationFrame(drawScene);
    updateUI();
};