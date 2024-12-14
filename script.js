// Flux工作流模板
let fluxWorkflow = null;
let workflowLoaded = false;
let currentWorkflowHandle = null;

// 默认工作流数据
const defaultWorkflow = {
  "5": {
    "inputs": {
      "width": 768,
      "height": 1344,
      "batch_size": 1
    },
    "class_type": "EmptyLatentImage",
    "_meta": {
      "title": "空Latent"
    }
  },
  "6": {
    "inputs": {
      "text": "A majestic teal sword decorated with diamonds and crystals, in a digital art style against a beautiful background, (ultra-detailed), (best quality, 4k, 8k, highres, masterpiece:1.2), extremely detailed CG unity 8k wallpaper, whimsical style, whimsical setting, sharp focus, (good proportions, cinematic angle:1.1), SwordDisplay",
      "speak_and_recognation": true,
      "clip": [
        "11",
        0
      ]
    },
    "class_type": "CLIPTextEncode",
    "_meta": {
      "title": "CLIP文本编码器"
    }
  },
  "8": {
    "inputs": {
      "samples": [
        "13",
        0
      ],
      "vae": [
        "10",
        0
      ]
    },
    "class_type": "VAEDecode",
    "_meta": {
      "title": "VAE解码"
    }
  },
  "9": {
    "inputs": {
      "filename_prefix": "ComfyUI",
      "images": [
        "8",
        0
      ]
    },
    "class_type": "SaveImage",
    "_meta": {
      "title": "保存图像"
    }
  },
  "10": {
    "inputs": {
      "vae_name": "FLUX.1-vae.sft"
    },
    "class_type": "VAELoader",
    "_meta": {
      "title": "VAE加载器"
    }
  },
  "11": {
    "inputs": {
      "clip_name1": "t5xxl_fp16.safetensors",
      "clip_name2": "clip_l.safetensors",
      "type": "flux"
    },
    "class_type": "DualCLIPLoader",
    "_meta": {
      "title": "双CLIP加载器"
    }
  },
  "12": {
    "inputs": {
      "unet_name": "flux1-dev-fp8.safetensors",
      "weight_dtype": "fp8_e5m2"
    },
    "class_type": "UNETLoader",
    "_meta": {
      "title": "UNET加载器"
    }
  },
  "13": {
    "inputs": {
      "noise": [
        "25",
        0
      ],
      "guider": [
        "22",
        0
      ],
      "sampler": [
        "16",
        0
      ],
      "sigmas": [
        "17",
        0
      ],
      "latent_image": [
        "5",
        0
      ]
    },
    "class_type": "SamplerCustomAdvanced",
    "_meta": {
      "title": "自定义采样器(高级)"
    }
  },
  "16": {
    "inputs": {
      "sampler_name": "euler"
    },
    "class_type": "KSamplerSelect",
    "_meta": {
      "title": "K采样器选择"
    }
  },
  "17": {
    "inputs": {
      "scheduler": "simple",
      "steps": 8,
      "denoise": 1,
      "model": [
        "12",
        0
      ]
    },
    "class_type": "BasicScheduler",
    "_meta": {
      "title": "基础调度器"
    }
  },
  "22": {
    "inputs": {
      "model": [
        "26",
        0
      ],
      "conditioning": [
        "6",
        0
      ]
    },
    "class_type": "BasicGuider",
    "_meta": {
      "title": "基础引导"
    }
  },
  "25": {
    "inputs": {
      "noise_seed": 539992584153830
    },
    "class_type": "RandomNoise",
    "_meta": {
      "title": "随机噪波"
    }
  },
  "26": {
    "inputs": {
      "lora_name": "Hyper-FLUX.1-dev-8steps-lora.safetensors",
      "strength_model": 0.13,
      "model": [
        "12",
        0
      ]
    },
    "class_type": "LoraLoaderModelOnly",
    "_meta": {
      "title": "LoRA加载器(仅模型)"
    }
  },
  "27": {
    "inputs": {
      "lora_name": "flux-zhihe-lora.safetensors",
      "strength_model": 0.8
    },
    "class_type": "LoraLoaderModelOnly",
    "_meta": {
      "title": "LoRA加载器(仅模型)"
    }
  }
};

// 加载工作流模板
async function loadWorkflowTemplate(fileHandle) {
    try {
        workflowLoaded = false;
        fluxWorkflow = null;

        if (!fileHandle) {
            // 如果没有选择文件，直接使用默认工作流
            fluxWorkflow = defaultWorkflow;
            workflowLoaded = true;
            console.log('Default workflow template loaded successfully');
            
            // 更新输入框显示默认文件名
            const workflowFileInput = document.getElementById('workflowFile');
            workflowFileInput.value = 'flux-20miao-2.json (默认)';
            return;
        }

        currentWorkflowHandle = fileHandle;
        const file = await fileHandle.getFile();
        const content = await file.text();
        const data = JSON.parse(content);
        
        fluxWorkflow = data;
        workflowLoaded = true;
        console.log('Workflow template loaded successfully');
        
        // 更新输入框显示文件名
        const workflowFileInput = document.getElementById('workflowFile');
        workflowFileInput.value = file.name;
    } catch (error) {
        console.error('Error loading workflow template:', error);
        alert('加载工作流模板失败，请检查文件是否为有效的JSON格式');
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const serverUrlInput = document.getElementById('serverUrl');
    const workflowFileInput = document.getElementById('workflowFile');
    const browseWorkflowBtn = document.getElementById('browseWorkflow');
    const promptInput = document.getElementById('prompt');
    const generateBtn = document.getElementById('generateBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const generatedImage = document.getElementById('generatedImage');
    const imageContainer = document.getElementById('imageContainer');
    const progressBar = document.getElementById('progress-bar');
    const progressPercent = document.getElementById('progress-percent');
    const elapsedTimeSpan = document.getElementById('elapsed-time');
    const estimatedTimeSpan = document.getElementById('estimated-time');
    const progressStep = document.getElementById('progress-step');

    // 页面加载完成后自动加载默认工作流
    loadWorkflowTemplate(null);

    // 监听工作流文件输入变化
    workflowFileInput.addEventListener('change', function() {
        // 当手动修改输入框时，提示用户使用浏览按钮
        alert('请使用"浏览..."按钮选择工作流文件');
        // 如果有当前文件，恢复显示当前文件名
        if (currentWorkflowHandle) {
            currentWorkflowHandle.getFile().then(file => {
                workflowFileInput.value = file.name;
            });
        }
    });

    // 浏览工作流文件
    browseWorkflowBtn.addEventListener('click', async function() {
        try {
            const handle = await window.showOpenFilePicker({
                types: [
                    {
                        description: 'JSON Files',
                        accept: {
                            'application/json': ['.json']
                        }
                    }
                ]
            });
            loadWorkflowTemplate(handle[0]);
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error selecting file:', err);
                alert('选择文件时发生错误');
            }
        }
    });

    // 初始提示用户选择工作流文件
    setTimeout(() => {
        if (!workflowLoaded) {
            alert('请点击"浏览..."按钮选择工作流文件');
        }
    }, 1000);

    // 检查服务器连接
    async function checkServerConnection(serverUrl) {
        try {
            console.log('检查服务器连接:', serverUrl);
            
            // 首先检查URL格式
            try {
                new URL(serverUrl);
            } catch (error) {
                throw new Error(`服务器地址格式无效: ${error.message}`);
            }

            // 尝试连接服务器
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

            try {
                const response = await fetch(`${serverUrl}/queue`, {
                    method: 'GET',
                    mode: 'cors',
                    headers: {
                        'Accept': 'application/json'
                    },
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`服务器响应错误: ${response.status} ${response.statusText}`);
                }

                console.log('服务器连接成功');
                return true;
            } catch (error) {
                if (error.name === 'AbortError') {
                    throw new Error('服务器连接超时，请检查服务器地址和状态');
                }
                throw error;
            }
        } catch (error) {
            console.error('服务器连接检查失败:', error);
            throw new Error(`无法连接到服务器: ${error.message}`);
        }
    }

    // 获取最新的图片文件
    async function getLatestImage(serverUrl, promptId, retryCount = 0) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

            try {
                console.log('正在获取输出信息...');
                const outputResponse = await fetch(`${serverUrl}/history/${promptId}`, {
                    method: 'GET',
                    mode: 'cors',
                    headers: {
                        'Accept': 'application/json'
                    },
                    signal: controller.signal
                });

                if (!outputResponse.ok) {
                    throw new Error(`获取输出信息失败: ${outputResponse.status} ${outputResponse.statusText}`);
                }

                const outputData = await outputResponse.json();
                console.log('输出信息:', outputData);

                // 检查是否有输出数据
                if (outputData && outputData.outputs && outputData.outputs["9"] && 
                    outputData.outputs["9"].images && outputData.outputs["9"].images.length > 0) {
                    
                    const imageName = outputData.outputs["9"].images[0].filename;
                    console.log('找到图片:', imageName);

                    // 构建完整的图片URL
                    const imageUrl = `${serverUrl}/view?filename=${encodeURIComponent(imageName)}`;
                    console.log('图片URL:', imageUrl);

                    // 检查图片是否可访问
                    const imageAccessible = await isImageAccessible(serverUrl, imageName);
                    if (!imageAccessible) {
                        throw new Error('图片文件不可访问');
                    }

                    return imageUrl;
                } else {
                    throw new Error('未找到图片输出');
                }
            } finally {
                clearTimeout(timeoutId);
            }
        } catch (error) {
            console.error('获取图片失败:', error);
            
            // 如果是中止错误，直接抛出
            if (error.name === 'AbortError') {
                throw new Error('获取图片超时');
            }

            // 重试逻辑
            if (retryCount < 3) {
                console.log(`重试获取图片 (${retryCount + 1}/3)...`);
                await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒后重试
                return getLatestImage(serverUrl, promptId, retryCount + 1);
            }

            throw new Error(`获取图片失败: ${error.message}`);
        }
    }

    // 检查图片是否存在且可访问
    async function isImageAccessible(serverUrl, imageName) {
        try {
            const response = await fetch(`${serverUrl}/view?filename=${encodeURIComponent(imageName)}`, {
                method: 'GET',
                mode: 'cors',
                signal: AbortSignal.timeout(5000)
            });
            return response.ok;
        } catch {
            return false;
        }
    }

    // 检查状态并获取图片
    async function checkStatus(serverUrl, promptId) {
        const startTime = new Date().getTime();
        let retryCount = 0;
        const maxRetries = 100;
        const retryInterval = 1000;
        let lastProgress = 0;

        console.log(`开始检查状态, promptId: ${promptId}`);

        while (retryCount < maxRetries) {
            try {
                console.log(`第 ${retryCount + 1} 次检查状态...`);
                
                const response = await fetch(`${serverUrl}/history/${promptId}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                let progress = 0;
                let stepDescription = '准备中...';
                
                if (data && data[promptId]) {
                    const promptData = data[promptId];
                    
                    // 检查是否有错误
                    if (promptData.error) {
                        throw new Error(`生成任务出错: ${promptData.error}`);
                    }

                    // 检查执行状态
                    if (promptData.status) {
                        const status = promptData.status;
                        
                        // 如果任务完成
                        if (status.completed) {
                            // 检查输出节点9的图片
                            if (promptData.outputs && promptData.outputs["9"] && 
                                promptData.outputs["9"].images && 
                                promptData.outputs["9"].images.length > 0) {
                                
                                const imageName = promptData.outputs["9"].images[0].filename;
                                const imageUrl = `${serverUrl}/view?filename=${encodeURIComponent(imageName)}`;
                                
                                updateProgress(100, startTime, '生成完成！');
                                await displayImage(imageUrl);
                                return;
                            } else {
                                throw new Error('未找到生成的图片');
                            }
                        }
                        // 如果任务正在执行
                        else if (status.executing) {
                            const currentNode = status.executing.node;
                            const nodeNum = parseInt(currentNode);
                            
                            // 基于节点进度计算
                            if (nodeNum <= 5) {
                                progress = Math.min(10, nodeNum * 2);
                            } else if (nodeNum <= 9) {
                                progress = 10 + (nodeNum - 5) * 3;
                            } else if (nodeNum <= 12) {
                                progress = 25 + (nodeNum - 9) * 6;
                            } else if (nodeNum <= 15) {
                                progress = 43 + (nodeNum - 12) * 4;
                            } else if (nodeNum <= 24) {
                                progress = 55 + (nodeNum - 15) * 3;
                            } else if (nodeNum <= 28) {
                                progress = 82 + (nodeNum - 24) * 3;
                            } else {
                                progress = 97;
                            }
                            
                            // 确保进度不会后退
                            progress = Math.max(progress, lastProgress);
                            progress = Math.min(progress, 99);
                            lastProgress = progress;
                            
                            // 获取步骤描述
                            stepDescription = getStepDescription(currentNode);
                        }
                        // 如果任务在等待
                        else if (status.waiting) {
                            progress = Math.min(5 + retryCount, 10);
                            stepDescription = '等待服务器响应...';
                        }
                    }
                }
                
                updateProgress(progress, startTime, stepDescription);

                await delay(retryInterval);
                retryCount++;
            } catch (error) {
                console.error('检查状态时出错:', error);
                throw error;
            }
        }
        throw new Error('超过最大重试次数');
    }

    // 显示生成的图片
    async function displayImage(imagePath) {
        if (!imagePath) {
            console.error('图片路径为空');
            throw new Error('未获取到图片路径');
        }
        
        console.log('尝试显示图片:', imagePath);
        
        try {
            // 检查图片是否存在
            const response = await fetch(imagePath);
            if (!response.ok) {
                throw new Error(`图片加载失败: ${response.status} ${response.statusText}`);
            }

            // 更新图片显示
            const generatedImage = document.getElementById('generatedImage');
            generatedImage.src = imagePath;
            generatedImage.classList.remove('hidden');
            
            console.log('图片加载成功');
            
            // 调整图片大小
            adjustImageSize();
        } catch (error) {
            console.error('显示图片时出错:', error);
            throw error;
        }
    }

    // 生成按钮点击事件
    generateBtn.addEventListener('click', async function() {
        try {
            if (!workflowLoaded) {
                alert('请等待工作流模板加载完成...');
                return;
            }

            // 禁用生成按钮
            generateBtn.disabled = true;

            // 重置进度显示
            resetProgress();
            
            // 显示加载指示器
            loadingIndicator.classList.remove('hidden');
            imageContainer.classList.add('hidden');
            generatedImage.classList.add('hidden');
            
            let baseUrl = serverUrlInput.value.trim();
            const prompt = promptInput.value.trim();

            // 基本验证
            if (!baseUrl) {
                throw new Error('请输入服务器地址');
            }

            if (!prompt) {
                throw new Error('请输入提示词');
            }

            // 移除末尾的斜杠
            baseUrl = baseUrl.replace(/\/+$/, '');

            try {
                // 首先检查服务器连接
                await checkServerConnection(baseUrl);
                
                // 准备请求数据
                const workflow = {
                    prompt: getWorkflow(prompt),
                    client_id: "flux_web"
                };
                console.log('发送工作流数据:', workflow);

                // 发送生成请求
                const response = await fetch(`${baseUrl}/prompt`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(workflow)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('请求失败:', errorText);
                    throw new Error(`生成请求失败: ${response.status} ${response.statusText}\n${errorText}`);
                }

                const data = await response.json();
                console.log('收到响应:', data);

                if (data.error) {
                    throw new Error(`生成请求失败: ${data.error}`);
                }

                const promptId = data.prompt_id;
                if (!promptId) {
                    throw new Error('未收到有效的promptId');
                }

                // 检查状态并获取图片
                await checkStatus(baseUrl, promptId);
            } catch (error) {
                console.error('生成过程出错:', error);
                throw error;
            }
        } catch (error) {
            console.error('生成图片时出错:', error);
            alert(error.message);
        } finally {
            // 恢复生成按钮
            generateBtn.disabled = false;
            // 隐藏加载指示器
            loadingIndicator.classList.add('hidden');
            imageContainer.classList.remove('hidden');
        }
    });

    // 图片自适应调整
    function adjustImageSize() {
        if (!generatedImage.classList.contains('hidden')) {
            const containerWidth = imageContainer.clientWidth;
            const containerHeight = imageContainer.clientHeight;
            const imgRatio = generatedImage.naturalWidth / generatedImage.naturalHeight;
            const containerRatio = containerWidth / containerHeight;

            if (imgRatio > containerRatio) {
                generatedImage.style.width = '100%';
                generatedImage.style.height = 'auto';
            } else {
                generatedImage.style.height = '100%';
                generatedImage.style.width = 'auto';
            }
        }
    }

    // 监听窗口大小变化
    window.addEventListener('resize', adjustImageSize);
    generatedImage.addEventListener('load', adjustImageSize);

    // 延迟函数
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 更新进度条和时间显示
    function updateProgress(percentage, startTime, stepDescription = '') {
        const progressBar = document.getElementById('progress-bar');
        const progressPercent = document.getElementById('progress-percent');
        const progressStep = document.getElementById('progress-step');
        const elapsedTimeSpan = document.getElementById('elapsed-time');
        const estimatedTimeSpan = document.getElementById('estimated-time');
        
        // 隐藏进度条
        progressBar.style.width = '0%';
        progressPercent.textContent = '';
        
        // 更新步骤描述
        if (stepDescription) {
            progressStep.textContent = stepDescription;
        }
        
        // 计算已用时间
        const currentTime = new Date().getTime();
        const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
        const elapsedMinutes = Math.floor(elapsedSeconds / 60);
        const elapsedRemainderSeconds = elapsedSeconds % 60;
        elapsedTimeSpan.textContent = 
            `已用: ${String(elapsedMinutes).padStart(2, '0')}:${String(elapsedRemainderSeconds).padStart(2, '0')}`;
        
        // 预计总时间
        if (percentage > 0 && percentage < 100) {
            // 根据已用时间和当前进度预估总时间
            const estimatedTotalSeconds = Math.floor((elapsedSeconds / percentage) * 100);
            
            const totalMinutes = Math.floor(estimatedTotalSeconds / 60);
            const totalRemainderSeconds = estimatedTotalSeconds % 60;
            
            estimatedTimeSpan.textContent = 
                `预计总需: ${String(totalMinutes).padStart(2, '0')}:${String(totalRemainderSeconds).padStart(2, '0')}`;
        } else if (percentage >= 100) {
            estimatedTimeSpan.textContent = '预计总需: 00:00';
        }
    }

    // 获取步骤描述
    function getStepDescription(nodeId) {
        const nodeNum = parseInt(nodeId);
        
        // 详细的步骤映射和阶段描述
        const phaseDescriptions = [
            { range: [1, 5], description: '系统初始化...' },
            { range: [6, 9], description: '准备生成环境...' },
            { range: [10, 12], description: '加载AI模型...' },
            { range: [13, 15], description: '开始图像生成...' },
            { range: [16, 24], description: '图像细节处理...' },
            { range: [25, 28], description: '图像优化中...' },
            { range: [29, 29], description: '即将完成...' }
        ];
        
        // 查找匹配的阶段描述
        const matchedPhase = phaseDescriptions.find(
            phase => nodeNum >= phase.range[0] && nodeNum <= phase.range[1]
        );
        
        return matchedPhase ? matchedPhase.description : '处理中...';
    }

    // 重置进度显示
    function resetProgress() {
        const progressBar = document.getElementById('progress-bar');
        const progressPercent = document.getElementById('progress-percent');
        const progressStep = document.getElementById('progress-step');
        const elapsedTimeSpan = document.getElementById('elapsed-time');
        const estimatedTimeSpan = document.getElementById('estimated-time');
        
        progressBar.style.width = '0%';
        progressPercent.textContent = '0%';
        progressStep.textContent = '准备中...';
        elapsedTimeSpan.textContent = '已用: 00:00';
        estimatedTimeSpan.textContent = '预计总需: 00:30';
    }

    // 获取工作流数据
    function getWorkflow(prompt) {
        if (!fluxWorkflow) {
            throw new Error('工作流模板未加载');
        }

        // 克隆工作流数据
        const workflow = JSON.parse(JSON.stringify(fluxWorkflow));
        
        // 更新提示词
        if (workflow["6"] && workflow["6"].inputs) {
            workflow["6"].inputs.text = prompt;
        }

        return workflow;
    }
});
