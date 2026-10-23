// src/App.js
import React, { useEffect, useRef, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, AreaChart, Area
} from 'recharts';
import {
  Cloud, Droplets, Thermometer, Sun, Leaf, TrendingUp, MapPin, Calendar,
  RefreshCw, Layers, Camera, Wifi, Bell, Shield, Zap,
  Brain, Target, Users, Award, Globe, Activity, Mic, MapPin as MapPinIcon
} from 'lucide-react';
 
// =============================================================================
// SEMESTER CONFIGURATION
// Set SEM7_MODE = true  → shows only Semester 7 features (current)
// Set SEM7_MODE = false → restores all Semester 8 features (future)
// =============================================================================
const SEM7_MODE = true;
 
const CropRecommendationSystem = () => {
  /* -------------------------
     State: data + UI states
     ------------------------- */
  const [inputData, setInputData] = useState({
    nitrogen: 50,
    phosphorus: 30,
    potassium: 40,
    temperature: 25,
    humidity: 65,
    ph: 6.5,
    rainfall: 150,
    location: 'Maharashtra',
    season: 'Kharif',
    farmSize: 2.5
  });
 
  const [recommendations, setRecommendations] = useState([]);
  const [weatherForecast, setWeatherForecast] = useState([]);
  const [soilAnalysis, setSoilAnalysis] = useState({});
  const [marketPrices, setMarketPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [diseaseAnalysis, setDiseaseAnalysis] = useState(null);
  const [iotData, setIotData] = useState({});
  const [sustainabilityScore, setSustainabilityScore] = useState(0);
  const [carbonFootprint, setCarbonFootprint] = useState({});
  const [communityData, setCommunityData] = useState({});
  const [yieldPrediction, setYieldPrediction] = useState({});
 
  // Soil + Voice states
  const [soilReport, setSoilReport] = useState(null);
  const [soilAnalysisResult, setSoilAnalysisResult] = useState(null);
  const [isProcessingSoil, setIsProcessingSoil] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceInput, setVoiceInput] = useState('');
  const [voiceResponse, setVoiceResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
 
  // Language (i18n)
  const [language, setLanguage] = useState('en');
  const translations = {
    en: {
      farmParams: "Farm Parameters",
      generate: "Generate Smart Recommendations",
      analyzing: "AI is analyzing your farm data...",
      recommendations: "AI-Powered Crop Recommendations",
      soilUpload: "Upload Soil Report (PDF/Image)",
      analyzingSoil: "Analyzing soil report with AI...",
      voiceAssistant: "Voice Assistant",
      startVoice: "Start Voice",
      stop: "Stop",
      youSaid: "You said",
      ai: "AI",
      smartAlerts: "Smart Alerts",
      overview: "Overview",
      advanced: "Advanced Analytics",
      disease: "Disease Detection",
      iot: "IoT Monitoring",
      sustainability: "Sustainability",
      community: "Community",
      selectImage: "Select Image",
      uploadCropImage: "Upload a photo of your crop for AI analysis",
      treatment: "Treatment Recommendations",
      prevention: "Prevention Strategies",
      soilReportAnalyzed: "Soil report analyzed successfully."
    },
    hi: {
      farmParams: "खेती के मापदंड",
      generate: "स्मार्ट सिफ़ारिशें प्राप्त करें",
      analyzing: "एआई आपके खेत का विश्लेषण कर रहा है...",
      recommendations: "एआई आधारित फसल सुझाव",
      soilUpload: "मिट्टी की रिपोर्ट अपलोड करें (पीडीएफ/छवि)",
      analyzingSoil: "एआई से मिट्टी की रिपोर्ट का विश्लेषण हो रहा है...",
      voiceAssistant: "वॉइस असिस्टेंट",
      startVoice: "आवाज़ शुरू करें",
      stop: "रोकें",
      youSaid: "आपने कहा",
      ai: "एआई",
      smartAlerts: "स्मार्ट अलर्ट",
      overview: "ओवरव्यू",
      advanced: "एडवांस्ड एनालिटिक्स",
      disease: "रोग पहचान",
      iot: "आईओटी मॉनिटरिंग",
      sustainability: "सस्टेनेबिलिटी",
      community: "समुदाय",
      selectImage: "छवि चुनें",
      uploadCropImage: "एआई विश्लेषण के लिए अपनी फसल की फोटो अपलोड करें",
      treatment: "उपचार सिफारिशें",
      prevention: "रोकथाम रणनीतियाँ",
      soilReportAnalyzed: "मिट्टी की रिपोर्ट सफलतापूर्वक विश्लेषित की गई।"
    },
    ta: {
      farmParams: "விவசாய அளவுருக்கள்",
      generate: "ஸ்மார்ட் பரிந்துரைகள் உருவாக்கவும்",
      analyzing: "ஏஐ உங்கள் பண்ணை தரவை பகுப்பாய்வு செய்கிறது...",
      recommendations: "ஏஐ சக்திவாய்ந்த பயிர் பரிந்துரைகள்",
      soilUpload: "மண் அறிக்கையை பதிவேற்றவும் (PDF/படம்)",
      analyzingSoil: "ஏஐ மூலம் மண் அறிக்கை பகுப்பாய்வு செய்யப்படுகிறது...",
      voiceAssistant: "குரல் உதவியாளர்",
      startVoice: "குரல் தொடங்கு",
      stop: "நிறுத்து",
      youSaid: "நீங்கள் கூறியது",
      ai: "ஏஐ",
      smartAlerts: "ஸ்மார்ட் அலெர்ட்கள்",
      overview: "ஓவர்வியூ",
      advanced: "அதிக நுண்ணறிவு",
      disease: "நோய் கண்டறிதல்",
      iot: "IoT கண்காணிப்பு",
      sustainability: "திறமையான பசுமை",
      community: "சமூகம்",
      selectImage: "படத்தைத் தேர்ந்தெடு",
      uploadCropImage: "ஏஐ பகுப்பாய்விற்காக உங்கள் பயிர் புகைப்படத்தை பதிவேற்றவும்",
      treatment: "சிகிச்சை பரிந்துரைகள்",
      prevention: "தடுப்பு ஐக்கியங்கள்",
      soilReportAnalyzed: "மண் அறிக்கை வெற்றிகரமாகப் பகுப்பாய்வு செய்யப்பட்டது."
    },
    te: {
      farmParams: "వ్యవసాయ పరామితులు",
      generate: "స్మార్ట్ సిఫార్సులు తయారు చేయండి",
      analyzing: "AI మీ పొలం డేటా విశ్లేషిస్తుంది...",
      recommendations: "AI ఆధారిత పంట సిఫార్సులు",
      soilUpload: "మట్టిపరీక్ష నివేదికను అప్‌లోడ్ చేయండి (PDF/చిత్రం)",
      analyzingSoil: "AI తో మట్టి నివేదిక విశ్లేషణ జరుగుతోంది...",
      voiceAssistant: "వాయిస్ అసిస్టెంట్",
      startVoice: "వాయిస్ ప్రారంభించండి",
      stop: "ఆపండి",
      youSaid: "మీరు చెప్పినది",
      ai: "AI",
      smartAlerts: "స్మార్ట్ అలెర్ట్స్",
      overview: "ఓవర్వ్యూకు",
      advanced: "అద్వాన్స్డ్ విశ్లేషణ",
      disease: "రోగ గుర్తింపు",
      iot: "IoT పరిశీలన",
      sustainability: "టైనిబిలిటీ",
      community: "కమ్యూనిటీ",
      selectImage: "చిత్రాన్ని ఎంపిక చేయండి",
      uploadCropImage: "AI విశ్లేషణ కోసం మీ పంట ఫోటో అప్‌లోడ్ చేయండి",
      treatment: "చికిత్స సూచనలు",
      prevention: "ప్రివెన్షన్ వ్యూహాలు",
      soilReportAnalyzed: "మట్టిపరీక్ష నివేదిక విజయవంతంగా విశ్లేషించబడినది."
    }
  };
  const t = (key) => translations[language]?.[key] || translations.en[key] || key;
 
  /* -------------------------
     Refs
     ------------------------- */
  const fileInputRef = useRef(null);
  const soilFileRef = useRef(null);
  const recognitionRef = useRef(null);
 
  /* -------------------------
     Crop DB (extended)
     ------------------------- */
  const cropDatabase = {
    'Rice': {
      nitrogen: [20, 50], phosphorus: [15, 35], potassium: [15, 40],
      temperature: [20, 35], humidity: [50, 80], ph: [5.5, 7.0], rainfall: [100, 300],
      season: ['Kharif'], profit: 45000, riskLevel: 'Medium', duration: 120,
      waterRequirement: 'High', carbonFootprint: 2.5, diseases: ['Blast', 'Brown Spot', 'Sheath Blight']
    },
    'Wheat': {
      nitrogen: [40, 70], phosphorus: [20, 40], potassium: [20, 50],
      temperature: [15, 25], humidity: [40, 70], ph: [6.0, 7.5], rainfall: [50, 150],
      season: ['Rabi'], profit: 38000, riskLevel: 'Low', duration: 110,
      waterRequirement: 'Medium', carbonFootprint: 1.8, diseases: ['Rust', 'Smut', 'Bunt']
    },
    'Cotton': {
      nitrogen: [30, 60], phosphorus: [25, 45], potassium: [25, 55],
      temperature: [21, 32], humidity: [50, 85], ph: [5.5, 8.0], rainfall: [100, 250],
      season: ['Kharif'], profit: 55000, riskLevel: 'High', duration: 180,
      waterRequirement: 'High', carbonFootprint: 3.2, diseases: ['Bollworm', 'Wilt', 'Leaf Curl']
    },
    'Sugarcane': {
      nitrogen: [40, 80], phosphorus: [30, 50], potassium: [40, 80],
      temperature: [20, 35], humidity: [60, 90], ph: [6.0, 8.0], rainfall: [150, 400],
      season: ['Kharif'], profit: 70000, riskLevel: 'Medium', duration: 300,
      waterRequirement: 'Very High', carbonFootprint: 2.1, diseases: ['Red Rot', 'Smut', 'Wilt']
    },
    'Soybean': {
      nitrogen: [20, 40], phosphorus: [15, 30], potassium: [20, 40],
      temperature: [20, 30], humidity: [50, 80], ph: [6.0, 7.5], rainfall: [100, 200],
      season: ['Kharif'], profit: 35000, riskLevel: 'Low', duration: 90,
      waterRequirement: 'Low', carbonFootprint: 0.8, diseases: ['Rust', 'Mosaic', 'Pod Borer']
    },
    'Maize': {
      nitrogen: [30, 60], phosphorus: [20, 40], potassium: [25, 50],
      temperature: [18, 32], humidity: [45, 75], ph: [5.8, 7.5], rainfall: [80, 180],
      season: ['Kharif', 'Rabi'], profit: 40000, riskLevel: 'Medium', duration: 100,
      waterRequirement: 'Medium', carbonFootprint: 1.5, diseases: ['Borer', 'Leaf Blight', 'Rust']
    }
  };
 
  /* -------------------------
     Core logic
     ------------------------- */
  const calculateCropSuitability = (requirements, inputs) => {
    const factors = ['nitrogen', 'phosphorus', 'potassium', 'temperature', 'humidity', 'ph', 'rainfall'];
    let totalScore = 0;
    let maxScore = factors.length * 100;
 
    factors.forEach(factor => {
      const [min, max] = requirements[factor];
      const value = inputs[factor];
      if (value >= min && value <= max) {
        totalScore += 100;
      } else {
        const distance = Math.min(Math.abs(value - min), Math.abs(value - max));
        const penalty = Math.min(distance * 5, 100);
        totalScore += Math.max(0, 100 - penalty);
      }
    });
 
    if (requirements.season.includes(inputs.season)) {
      totalScore += 50;
      maxScore += 50;
    }
 
    const resilienceBonus = requirements.riskLevel === 'Low' ? 20 : 0;
    totalScore += resilienceBonus;
    maxScore += resilienceBonus > 0 ? 20 : 0;
 
    return (totalScore / maxScore) * 100;
  };
 
  const generateRecommendations = () => {
    setLoading(true);
 
    setTimeout(() => {
      const cropScores = Object.entries(cropDatabase).map(([crop, requirements]) => ({
        crop,
        suitability: calculateCropSuitability(requirements, inputData),
        profit: requirements.profit * inputData.farmSize,
        riskLevel: requirements.riskLevel,
        duration: requirements.duration,
        requirements,
        waterRequirement: requirements.waterRequirement,
        carbonFootprint: requirements.carbonFootprint,
        diseases: requirements.diseases
      }));
 
      const sortedRecommendations = cropScores.sort((a, b) => b.suitability - a.suitability).slice(0, 6);
      setRecommendations(sortedRecommendations);
 
      // weather
      const forecast = Array.from({ length: 14 }, (_, i) => ({
        day: `Day ${i + 1}`,
        temperature: 22 + Math.random() * 8,
        humidity: 55 + Math.random() * 25,
        rainfall: Math.random() * 20,
        windSpeed: 5 + Math.random() * 15,
        uvIndex: 3 + Math.random() * 7,
        soilMoisture: 40 + Math.random() * 40
      }));
      setWeatherForecast(forecast);
 
      // soil analysis
      setSoilAnalysis({
        fertility: inputData.nitrogen > 40 ? 'High' : inputData.nitrogen > 20 ? 'Medium' : 'Low',
        organic_matter: (inputData.phosphorus / 10).toFixed(1) + '%',
        drainage: inputData.potassium > 35 ? 'Good' : 'Moderate',
        ph_status: inputData.ph > 7.5 ? 'Alkaline' : inputData.ph > 6.0 ? 'Neutral' : 'Acidic',
        compaction: Math.random() > 0.7 ? 'High' : 'Normal',
        microbial_activity: Math.random() > 0.5 ? 'Active' : 'Moderate',
        erosion_risk: Math.random() > 0.6 ? 'High' : 'Low'
      });
 
      // market
      setMarketPrices(sortedRecommendations.map(rec => ({
        crop: rec.crop,
        currentPrice: 2000 + Math.random() * 3000,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        forecast: 2200 + Math.random() * 2800,
        volatility: Math.random() * 0.3,
        demandIndex: 60 + Math.random() * 40
      })));
 
      // iot
      setIotData({
        soilMoisture: 45 + Math.random() * 30,
        soilTemperature: 18 + Math.random() * 12,
        airQuality: 80 + Math.random() * 20,
        lightIntensity: 30000 + Math.random() * 20000,
        batteryLevel: 75 + Math.random() * 25,
        lastUpdate: new Date().toLocaleTimeString()
      });
 
      // sustainability
      const avgCarbonFootprint = sortedRecommendations.reduce((acc, rec) => acc + rec.carbonFootprint, 0) / sortedRecommendations.length;
      setSustainabilityScore(Math.max(0, 100 - (avgCarbonFootprint * 20)));
      setCarbonFootprint({
        current: avgCarbonFootprint,
        reduction: 15 + Math.random() * 25,
        comparison: 'Better than 78% of similar farms'
      });
 
      setCommunityData({
        nearbyFarmers: 156,
        successStories: 23,
        sharedKnowledge: 89,
        cooperativeMembers: 45
      });
 
      setYieldPrediction({
        expectedYield: (inputData.farmSize * (3000 + Math.random() * 2000)).toFixed(0),
        confidence: 85 + Math.random() * 10,
        factors: ['Weather favorable', 'Soil conditions optimal', 'Market demand high']
      });
 
      setNotifications([
        { id: 1, type: 'weather', message: 'Heavy rainfall expected in next 3 days', priority: 'high' },
        { id: 2, type: 'market', message: 'Cotton prices increased by 8%', priority: 'medium' },
        { id: 3, type: 'disease', message: 'Leaf blight detected in nearby farms', priority: 'high' },
        { id: 4, type: 'iot', message: 'Soil moisture levels optimal', priority: 'low' }
      ]);
 
      setLoading(false);
    }, 1200);
  };
 
  useEffect(() => {
    generateRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
 
  /* -------------------------
     Handlers: inputs, image, soil, voice
     ------------------------- */
  const handleInputChange = (field, value) => {
    setInputData(prev => ({
      ...prev,
      [field]: field === 'location' || field === 'season' ? value : parseFloat(value) || value
    }));
  };
 
  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target.result);
      setDiseaseAnalysis(null);
      setTimeout(() => {
        setDiseaseAnalysis({
          detected: Math.random() > 0.3,
          disease: 'Leaf Blight',
          confidence: 92.5,
          severity: 'Moderate',
          treatment: ['Apply fungicide spray', 'Improve drainage', 'Remove affected leaves'],
          prevention: ['Regular monitoring', 'Crop rotation', 'Resistant varieties']
        });
      }, 1500);
    };
    reader.readAsDataURL(file);
  };
 
  const handleSoilReportUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSoilReport(file.name);
      setIsProcessingSoil(true);
      setTimeout(() => {
        const mockSoilData = {
          nitrogen: 35 + Math.random() * 30,
          phosphorus: 20 + Math.random() * 25,
          potassium: 30 + Math.random() * 30,
          ph: 6.0 + Math.random() * 1.5,
          organicMatter: 2.5 + Math.random() * 2.0
        };
        setSoilAnalysisResult(mockSoilData);
        setInputData(prev => ({ ...prev, nitrogen: mockSoilData.nitrogen, phosphorus: mockSoilData.phosphorus, potassium: mockSoilData.potassium, ph: mockSoilData.ph }));
        setIsProcessingSoil(false);
        const msg = t('soilReportAnalyzed');
        setVoiceResponse(msg);
        speakText(msg);
      }, 2000);
    };
    reader.readAsDataURL(file);
  };
 
  const startListening = () => {
    if (typeof window === 'undefined') return;
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'ta' ? 'ta-IN' : language === 'te' ? 'te-IN' : 'en-IN';
      recognition.onstart = () => { setIsListening(true); setVoiceInput(''); };
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setVoiceInput(transcript);
        handleVoiceCommand(transcript);
      };
      recognition.onerror = (event) => {
        setIsListening(false);
        setVoiceInput('Voice recognition error');
      };
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
      recognition.start();
    } else {
      alert('Speech recognition not supported in this browser');
    }
  };
 
  const handleVoiceCommand = (command) => {
    let response = '';
    const lc = command.toLowerCase();
    if (lc.includes('recommend') || lc.includes('suggest') || lc.includes('crop')) {
      const top = recommendations[0];
      if (top) response = `I recommend ${top.crop} with ${top.suitability.toFixed(0)}% compatibility. Risk: ${top.riskLevel}. Potential profit: ${(top.profit / 1000).toFixed(0)}k.`;
      else response = 'Please run analysis first.';
    } else if (lc.includes('weather') || lc.includes('forecast')) {
      if (weatherForecast.length > 0) {
        const today = weatherForecast[0];
        response = `Today's forecast: ${today.temperature.toFixed(0)}°C, humidity ${today.humidity.toFixed(0)}%.`;
      } else response = 'Weather data not available.';
    } else if (lc.includes('soil') || lc.includes('nitrogen') || lc.includes('ph')) {
      response = `Soil: N ${inputData.nitrogen}, P ${inputData.phosphorus}, K ${inputData.potassium}, pH ${inputData.ph}.`;
    } else if (lc.includes('analysis') || lc.includes('analyze')) {
      generateRecommendations();
      response = 'Starting analysis now.';
    } else {
      response = `I heard "${command}". I can help with recommendations, weather, soil analysis, or start a new analysis.`;
    }
    setVoiceResponse(response);
    speakText(response);
  };
 
  const speakText = (text) => {
    if (typeof window === 'undefined') return;
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : language === 'ta' ? 'ta-IN' : language === 'te' ? 'te-IN' : 'en-IN';
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };
 
  const stopSpeaking = () => {
    if (typeof window === 'undefined') return;
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };
 
  /* -------------------------
     Small helpers
     ------------------------- */
  const getFieldIcon = (key) => {
    switch (key) {
      case 'nitrogen': return <Leaf size={16} className="text-green-500" />;
      case 'phosphorus': return <Layers size={16} className="text-orange-500" />;
      case 'potassium': return <Sun size={16} className="text-yellow-500" />;
      case 'ph': return <Droplets size={16} className="text-blue-500" />;
      case 'temperature': return <Thermometer size={16} className="text-red-500" />;
      case 'humidity': return <Cloud size={16} className="text-cyan-500" />;
      case 'rainfall': return <Droplets size={16} className="text-blue-500" />;
      case 'location': return <MapPinIcon size={16} className="text-gray-500" />;
      case 'season': return <Calendar size={16} className="text-emerald-500" />;
      case 'farmSize': return <TrendingUp size={16} className="text-purple-500" />;
      default: return null;
    }
  };
 
  // --- SEM8: Tab definitions for Semester 8 features ---
  // To reactivate: set SEM7_MODE = false at the top of this file.
  const sem8Tabs = [
    { id: 'disease',        name: t('disease'),        icon: Camera }, // SEM8: Disease Detection (PlantVillage CNN model)
    { id: 'iot',            name: t('iot'),             icon: Wifi   }, // SEM8: IoT Monitoring (real sensor integration)
    { id: 'sustainability', name: t('sustainability'),  icon: Leaf   }, // SEM8: Sustainability Analytics
    { id: 'community',      name: t('community'),       icon: Users  }, // SEM8: Community Network
  ];
 
  // Semester 7: only Overview and Advanced Analytics are visible.
  // Semester 8: set SEM7_MODE = false at the top to restore all tabs.
  const tabs = [
    { id: 'overview', name: t('overview'), icon: Target },
    { id: 'advanced', name: t('advanced'), icon: Brain  },
    ...(SEM7_MODE ? [] : sem8Tabs),
  ];
 
  const radarData = recommendations.slice(0, 5).map(rec => ({
    crop: rec.crop,
    suitability: rec.suitability,
    profit: (rec.profit / 1000) / 10,
    sustainability: 100 - (rec.carbonFootprint * 20 || 0),
    riskScore: rec.riskLevel === 'Low' ? 90 : rec.riskLevel === 'Medium' ? 60 : 30
  }));
 
  /* -------------------------
     Render
     ------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-teal-50 p-4 font-sans">
      <div className="max-w-8xl mx-auto">
        {/* Header / Language */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
              <Leaf className="text-green-600" size={40} />
              SmartCrop AI Pro
            </h1>
            <p className="text-gray-600">Next-Generation Intelligent Farming Assistant</p>
          </div>
 
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">Language</div>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="border rounded px-2 py-1">
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="ta">தமிழ்</option>
              <option value="te">తెలుగు</option>
            </select>
          </div>
        </div>
 
        {/* SEM8: Smart Alerts / Notification Bar
            Hidden in Semester 7 — notifications will be driven by real backend
            events (weather API thresholds, ML alerts, IoT triggers) in Semester 8.
            To reactivate: set SEM7_MODE = false at the top of this file. */}
        {!SEM7_MODE && notifications.length > 0 && (
          <div className="mb-6 bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="text-orange-500" size={20} />
              <h3 className="text-lg font-semibold text-gray-800">{t('smartAlerts')}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {notifications.map(notif => (
                <div key={notif.id} className={`p-3 rounded-lg border-l-4 ${
                  notif.priority === 'high' ? 'border-red-500 bg-red-50' :
                    notif.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                      'border-green-500 bg-green-50'
                }`}>
                  <p className="text-sm font-medium text-gray-700">{notif.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
 
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="flex flex-wrap justify-center border-b border-gray-200">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === tab.id ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <tab.icon size={18} />
                {tab.name}
              </button>
            ))}
          </div>
        </div>
 
        {/* Main: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Left: Parameters + Soil + Voice */}
            <div className="lg:col-span-1 bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MapPinIcon className="text-blue-500" size={20} />
                {t('farmParams')}
              </h2>
 
              <div className="space-y-4">
                {Object.entries(inputData).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      {getFieldIcon(key)}
                      {key}
                    </label>
                    {typeof value === 'string' ? (
                      (key === 'season' || key === 'location') ? (
                        <select value={value} onChange={(e) => handleInputChange(key, e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                          {key === 'season' && (<>
                            <option value="Kharif">Kharif (Monsoon)</option>
                            <option value="Rabi">Rabi (Winter)</option>
                            <option value="Summer">Summer</option>
                          </>)}
                          {key === 'location' && (<>
                            <option value="Maharashtra">Maharashtra</option>
                            <option value="Punjab">Punjab</option>
                            <option value="Uttar Pradesh">Uttar Pradesh</option>
                          </>)}
                        </select>
                      ) : (
                        <input value={value} onChange={(e) => handleInputChange(key, e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                      )
                    ) : (
                      <input type="number" step={key === 'ph' || key === 'farmSize' ? "0.1" : "1"} value={value} onChange={(e) => handleInputChange(key, e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                    )}
                  </div>
                ))}
              </div>
 
              <button onClick={generateRecommendations} disabled={loading} className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl">
                {loading ? (<><RefreshCw className="animate-spin inline-block" size={16} /> {t('analyzing')}</>) : (<><Brain size={16} className="inline-block mr-2" /> {t('generate')}</>)}
              </button>
 
              {/* Soil Report Upload */}
              <div className="mt-6 bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Layers className="text-purple-500" size={18} />
                  {t('soilUpload')}
                </h3>
                <input type="file" ref={soilFileRef} onChange={handleSoilReportUpload} accept=".pdf,image/*" className="block w-full text-sm text-gray-600" />
                {isProcessingSoil && <p className="text-sm text-blue-600 mt-2">{t('analyzingSoil')}</p>}
                {soilAnalysisResult && (
                  <div className="mt-3 text-sm text-gray-700 bg-white p-3 rounded-lg shadow">
                    <p><strong>N:</strong> {soilAnalysisResult.nitrogen.toFixed(1)}</p>
                    <p><strong>P:</strong> {soilAnalysisResult.phosphorus.toFixed(1)}</p>
                    <p><strong>K:</strong> {soilAnalysisResult.potassium.toFixed(1)}</p>
                    <p><strong>pH:</strong> {soilAnalysisResult.ph.toFixed(1)}</p>
                    <p><strong>Organic Matter:</strong> {soilAnalysisResult.organicMatter.toFixed(1)}%</p>
                  </div>
                )}
              </div>
 
              {/* SEM8: Voice Assistant
                  Hidden in Semester 7 — not in Sem 7 scope.
                  All handler functions (startListening, stopSpeaking, handleVoiceCommand,
                  speakText) and state (isListening, voiceInput, voiceResponse, isSpeaking)
                  are fully preserved above. To reactivate: set SEM7_MODE = false. */}
              {!SEM7_MODE && (
                <div className="mt-6 bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Mic className="text-red-500" size={18} />
                    {t('voiceAssistant')}
                  </h3>
                  <div className="flex gap-3">
                    <button onClick={startListening} disabled={isListening} className="bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">
                      🎤 {isListening ? '...' : t('startVoice')}
                    </button>
                    <button onClick={stopSpeaking} disabled={!isSpeaking} className="bg-gray-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">
                      🔇 {t('stop')}
                    </button>
                  </div>
                  {voiceInput && (<p className="mt-3 text-sm text-gray-700"><strong>{t('youSaid')}:</strong> {voiceInput}</p>)}
                  {voiceResponse && (<p className="mt-2 text-sm text-blue-700"><strong>{t('ai')}:</strong> {voiceResponse}</p>)}
                </div>
              )}
            </div>
 
            {/* Right: Recommendations */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Target className="text-green-600" size={24} />
                {t('recommendations')}
              </h2>
 
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
                    <Brain className="absolute inset-4 text-green-600" size={32} />
                  </div>
                  <p className="mt-4 text-gray-600">{t('analyzing')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((rec, idx) => (
                    <div key={rec.crop} className="bg-gradient-to-r from-gray-50 to-green-50 rounded-xl p-5 border-l-4 border-green-500 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="bg-green-100 text-green-800 text-lg font-bold px-3 py-2 rounded-full">#{idx + 1}</div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">{rec.crop}</h3>
                            <div className="text-sm text-gray-600">Water: {rec.waterRequirement} | Carbon: {rec.carbonFootprint}kg CO₂/kg</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">{rec.suitability.toFixed(1)}%</div>
                          <div className="text-sm text-gray-500">AI Match Score</div>
                        </div>
                      </div>
 
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-blue-500" />
                          <span>{rec.duration} days</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp size={16} className="text-green-500" />
                          <span>₹{(rec.profit / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="text-orange-500" size={16} />
                          <span>{rec.riskLevel} Risk</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="text-purple-500" size={16} />
                          <span>{rec.diseases.length} Common Diseases</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
 
        {/* Advanced */}
        {activeTab === 'advanced' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Cloud className="text-blue-500" size={20} />
                14-Day Advanced Weather Forecast
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={weatherForecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="temperature" stackId="1" stroke="#FF5733" fill="#FF5733" fillOpacity={0.3} name="Temperature" />
                  <Area type="monotone" dataKey="humidity" stackId="2" stroke="#337AFF" fill="#337AFF" fillOpacity={0.3} name="Humidity" />
                  <Area type="monotone" dataKey="soilMoisture" stackId="3" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} name="Soil Moisture" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
 
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Target className="text-green-500" size={20} />
                Multi-Factor Crop Analysis
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="crop" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar name="Suitability" dataKey="suitability" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  <Radar name="Profit Potential" dataKey="profit" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                  <Radar name="Sustainability" dataKey="sustainability" stroke="#ffc658" fill="#ffc658" fillOpacity={0.3} />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
 
            {/* SEM8: Smart Market Intelligence
                Hidden in Semester 7 — market price data is randomly generated.
                Will connect to a real agri price API in Semester 8.
                State: marketPrices / setMarketPrices are preserved.
                To reactivate: set SEM7_MODE = false. */}
            {!SEM7_MODE && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="text-teal-500" size={20} />
                  Smart Market Intelligence
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={marketPrices}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="crop" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="currentPrice" fill="#3B82F6" name="Current Price" />
                    <Bar dataKey="forecast" fill="#10B981" name="Predicted Price" />
                    <Bar dataKey="demandIndex" fill="#F59E0B" name="Demand Index" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
 
            {/* SEM8: AI Yield Prediction
                Hidden in Semester 7 — yield values are randomly generated.
                Will use a dedicated ML regression model in Semester 8.
                State: yieldPrediction / setYieldPrediction are preserved.
                To reactivate: set SEM7_MODE = false. */}
            {!SEM7_MODE && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Brain className="text-purple-500" size={20} />
                  AI Yield Prediction
                </h3>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Expected Yield</span>
                      <span className="text-2xl font-bold text-purple-600">{yieldPrediction.expectedYield} kg</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">AI Confidence</span>
                      <span className="text-lg font-semibold text-green-600">{yieldPrediction.confidence?.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-800">Key Success Factors:</h4>
                    {yieldPrediction.factors?.map((factor, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        {factor}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
 
        {/* SEM8: Disease Detection Tab
            Hidden in Semester 7 — requires PlantVillage CNN model (Semester 8).
            All state (diseaseAnalysis, selectedImage) and handlers (handleImageUpload)
            are fully preserved. To reactivate: set SEM7_MODE = false. */}
        {!SEM7_MODE && activeTab === 'disease' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Camera className="text-blue-500" size={20} />
                {t('disease')}
              </h3>
 
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                  <Camera className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600 mb-4">{t('uploadCropImage')}</p>
                  <button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                    {t('selectImage')}
                  </button>
                </div>
 
                {selectedImage && (
                  <div className="space-y-4">
                    <img src={selectedImage} alt="Uploaded crop" className="w-full h-48 object-cover rounded-lg" />
                    {diseaseAnalysis ? (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-2">AI Analysis Results</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Disease Detected:</span>
                            <span className={`font-semibold ${diseaseAnalysis.detected ? 'text-red-600' : 'text-green-600'}`}>{diseaseAnalysis.detected ? diseaseAnalysis.disease : 'None'}</span>
                          </div>
                          {diseaseAnalysis.detected && (
                            <>
                              <div className="flex justify-between">
                                <span>Confidence:</span>
                                <span className="font-semibold">{diseaseAnalysis.confidence}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Severity:</span>
                                <span className="font-semibold text-orange-600">{diseaseAnalysis.severity}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
                        <p className="text-gray-600">AI is analyzing your image...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
 
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Shield className="text-green-500" size={20} />
                {t('treatment')}
              </h3>
 
              {diseaseAnalysis?.detected ? (
                <div className="space-y-4">
                  <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                    <h4 className="font-semibold text-red-800 mb-2">Immediate Actions</h4>
                    <ul className="space-y-1">
                      {diseaseAnalysis.treatment?.map((treat, idx) => (
                        <li key={idx} className="text-sm text-red-700 flex items-start gap-2"><span className="text-red-500 mt-1">•</span>{treat}</li>
                      ))}
                    </ul>
                  </div>
 
                  <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                    <h4 className="font-semibold text-green-800 mb-2">{t('prevention')}</h4>
                    <ul className="space-y-1">
                      {diseaseAnalysis.prevention?.map((p, idx) => (
                        <li key={idx} className="text-sm text-green-700 flex items-start gap-2"><span className="text-green-500 mt-1">•</span>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Shield className="mx-auto text-gray-400 mb-4" size={48} />
                  <p>Upload an image to get AI-powered disease detection and treatment recommendations</p>
                </div>
              )}
            </div>
          </div>
        )}
 
        {/* IoT */}
        {/* SEM8: IoT Monitoring Tab
            Hidden in Semester 7 — requires physical sensors and MQTT/REST integration (Semester 8).
            All state (iotData / setIotData) is preserved.
            To reactivate: set SEM7_MODE = false. */}
        {!SEM7_MODE && activeTab === 'iot' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Wifi className="text-blue-500" size={20} />
                IoT Sensor Network
              </h3>
 
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div><span className="font-medium">Soil Moisture</span></div>
                  <span className="font-bold text-green-600">{iotData.soilMoisture?.toFixed(1)}%</span>
                </div>
 
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div><span className="font-medium">Soil Temperature</span></div>
                  <span className="font-bold text-blue-600">{iotData.soilTemperature?.toFixed(1)}°C</span>
                </div>
 
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div><span className="font-medium">Air Quality</span></div>
                  <span className="font-bold text-purple-600">{iotData.airQuality?.toFixed(0)} AQI</span>
                </div>
 
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div><span className="font-medium">Light Intensity</span></div>
                  <span className="font-bold text-yellow-600">{iotData.lightIntensity?.toFixed(0)} lux</span>
                </div>
 
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between text-sm text-gray-600"><span>Last Update:</span><span className="font-medium">{iotData.lastUpdate}</span></div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mt-1"><span>Battery Level:</span><span className="font-medium">{iotData.batteryLevel?.toFixed(0)}%</span></div>
                </div>
              </div>
            </div>
 
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="text-green-500" size={20} />
                Real-time Environmental Monitoring
              </h3>
 
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weatherForecast.slice(0, 7)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="soilMoisture" stroke="#8B5CF6" strokeWidth={2} name="Soil Moisture %" />
                  <Line type="monotone" dataKey="temperature" stroke="#EF4444" strokeWidth={2} name="Temperature °C" />
                  <Line type="monotone" dataKey="uvIndex" stroke="#F59E0B" strokeWidth={2} name="UV Index" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
 
        {/* Sustainability */}
        {/* SEM8: Sustainability Analytics Tab
            Hidden in Semester 7 — score is derived from mock IoT + carbon data.
            All state (sustainabilityScore, carbonFootprint) is preserved.
            To reactivate: set SEM7_MODE = false. */}
        {!SEM7_MODE && activeTab === 'sustainability' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Leaf className="text-green-500" size={20} />
                {t('sustainability')}
              </h3>
 
              <div className="text-center mb-6">
                <div className="relative w-32 h-32 mx-auto">
                  <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
                  <div className="absolute inset-0 rounded-full border-8 border-green-500" style={{
                    borderRightColor: sustainabilityScore > 75 ? '#10B981' : sustainabilityScore > 50 ? '#F59E0B' : '#EF4444',
                    transform: `rotate(${(sustainabilityScore / 100) * 360}deg)`,
                    borderTopColor: 'transparent', borderLeftColor: 'transparent', borderBottomColor: 'transparent'
                  }}></div>
                  <div className="absolute inset-0 flex items-center justify-center"><span className="text-3xl font-bold text-gray-800">{sustainabilityScore.toFixed(0)}</span></div>
                </div>
                <p className="text-gray-600 mt-2">Sustainability Rating</p>
              </div>
 
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg"><span className="font-medium text-gray-700">Carbon Footprint</span><span className="font-bold text-green-600">{carbonFootprint.current?.toFixed(1)} kg CO₂</span></div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg"><span className="font-medium text-gray-700">Water Efficiency</span><span className="font-bold text-blue-600">Optimal</span></div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg"><span className="font-medium text-gray-700">Soil Health</span><span className="font-bold text-purple-600">Excellent</span></div>
              </div>
            </div>
 
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Globe className="text-blue-500" size={20} />
                Environmental Impact Analysis
              </h3>
 
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Carbon Reduction Potential</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-green-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full transition-all duration-500" style={{ width: `${carbonFootprint.reduction}%` }}></div>
                    </div>
                    <span className="text-green-800 font-bold">{carbonFootprint.reduction?.toFixed(0)}%</span>
                  </div>
                  <p className="text-sm text-green-700 mt-2">{carbonFootprint.comparison}</p>
                </div>
 
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-800">Eco-Friendly Recommendations:</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div>Implement drip irrigation to reduce water usage by 40%</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div>Use organic fertilizers to improve soil microbiome</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div>Rotate crops to maintain soil nutrients naturally</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
 
        {/* Community */}
        {/* SEM8: Community Network Tab
            Hidden in Semester 7 — all data is hardcoded static content.
            State (communityData) is preserved.
            To reactivate: set SEM7_MODE = false. */}
        {!SEM7_MODE && activeTab === 'community' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Users className="text-blue-500" size={20} />
                  {t('community')}
                </h3>
 
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg"><div className="text-2xl font-bold text-blue-600">{communityData.nearbyFarmers}</div><div className="text-sm text-gray-600">Nearby Farmers</div></div>
                  <div className="text-center p-4 bg-green-50 rounded-lg"><div className="text-2xl font-bold text-green-600">{communityData.successStories}</div><div className="text-sm text-gray-600">Success Stories</div></div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg"><div className="text-2xl font-bold text-yellow-600">{communityData.sharedKnowledge}</div><div className="text-sm text-gray-600">Tips Shared</div></div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg"><div className="text-2xl font-bold text-purple-600">{communityData.cooperativeMembers}</div><div className="text-sm text-gray-600">Co-op Members</div></div>
                </div>
 
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800">Recent Community Activity</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded"><div className="w-2 h-2 bg-green-500 rounded-full"></div><span>Rajesh shared a new irrigation technique</span></div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded"><div className="w-2 h-2 bg-blue-500 rounded-full"></div><span>New weather alert posted for your region</span></div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded"><div className="w-2 h-2 bg-yellow-500 rounded-full"></div><span>Cotton prices increased - discussion thread</span></div>
                  </div>
                </div>
              </div>
 
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Award className="text-yellow-500" size={20} />
                  Knowledge & Best Practices
                </h3>
 
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-800 mb-2">Top Farming Tip of the Week</h4>
                    <p className="text-orange-700 text-sm">"Apply neem oil spray early morning or late evening to prevent beneficial insects from being affected while controlling pests effectively."</p>
                    <div className="text-xs text-orange-600 mt-2">- Shared by Expert Farmer Suresh K.</div>
                  </div>
 
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Success Story</h4>
                    <p className="text-green-700 text-sm">"Increased my tomato yield by 35% using the crop rotation method suggested by the SmartCrop AI system."</p>
                    <div className="text-xs text-green-600 mt-2">- Farmer Priya M., Pune</div>
                  </div>
 
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Market Insight</h4>
                    <p className="text-blue-700 text-sm">"Organic vegetables are showing 20% higher prices this season. Consider transitioning to organic farming methods."</p>
                    <div className="text-xs text-blue-600 mt-2">- Market Analyst Report</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
 
        {/* Footer */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Leaf className="text-green-600" size={32} />
            <h3 className="text-2xl font-bold text-gray-800">SmartCrop AI Pro</h3>
          </div>
          <p className="text-gray-600 text-lg mb-4">Empowering farmers with AI-driven insights for sustainable and profitable agriculture</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2"><Brain size={16} className="text-purple-500" /><span>AI-Powered Analytics</span></div>
            <div className="flex items-center gap-2"><Globe size={16} className="text-blue-500" /><span>Global Weather Data</span></div>
            <div className="flex items-center gap-2"><Shield size={16} className="text-green-500" /><span>Disease Detection</span></div>
            <div className="flex items-center gap-2"><Users size={16} className="text-orange-500" /><span>Community Network</span></div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-400">© 2025 SmartCrop AI Pro. Built for the future of farming. All rights reserved.</div>
        </div>
      </div>
    </div>
  );
};
 
export default CropRecommendationSystem;