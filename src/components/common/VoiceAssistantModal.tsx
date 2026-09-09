import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Mic, MicOff, Volume2, X, Sparkles, ArrowRight } from 'lucide-react';

export const VoiceAssistantModal: React.FC = () => {
  const { 
    voiceModalOpen, 
    setVoiceModalOpen, 
    language, 
    postJobOffer, 
    acceptWorkerBid, 
    jobRequests, 
    speakText 
  } = useApp();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');

  useEffect(() => {
    if (voiceModalOpen) {
      const initialGreeting = language === 'hi' 
        ? 'सहकार सेतु आवाज सहायक में आपका स्वागत है। आप क्या सेवा बुक करना चाहते हैं?'
        : 'Welcome to SahakarSetu Voice Assistant. What cooperative service can we help you with?';
      setAiResponse(initialGreeting);
      speakText(initialGreeting);
    } else {
      setIsListening(false);
      setTranscript('');
    }
  }, [voiceModalOpen, language]);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    if (typeof window === 'undefined' || (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window))) {
      const sample = language === 'hi' ? 'पंखा रिपेयर के लिए इलेक्ट्रीशियन बुक करें' : 'Book an electrician for fan repair';
      setTranscript(sample);
      handleVoiceCommand(sample);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setIsListening(false);
        handleVoiceCommand(text);
      };

      recognition.onerror = () => {
        setIsListening(false);
        const fallback = language === 'hi' ? 'इलेक्ट्रीशियन बुक करें' : 'Book an electrician';
        setTranscript(fallback);
        handleVoiceCommand(fallback);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
      const fallback = 'Book an electrician';
      setTranscript(fallback);
      handleVoiceCommand(fallback);
    }
  };

  const handleVoiceCommand = async (command: string) => {
    const lower = command.toLowerCase();

    // 1. Worker Accept Command
    if (lower.includes('accept') || lower.includes('स्वीकार') || lower.includes('ha') || lower.includes('yes')) {
      const pendingJob = jobRequests.find(j => j.status === 'BIDDING_OPEN' || j.status === 'NEGOTIATING');
      if (pendingJob && pendingJob.bids.length > 0) {
        await acceptWorkerBid(pendingJob.id, pendingJob.bids[0].id);
        const msg = language === 'hi' ? 'कार्य सफलतापूर्वक स्वीकार कर लिया गया है।' : 'Job successfully accepted!';
        setAiResponse(msg);
        speakText(msg);
        return;
      }
    }

    // 2. Electrician booking
    if (lower.includes('electrician') || lower.includes('bijli') || lower.includes('fan') || lower.includes('इलेक्ट्रीशियन') || lower.includes('पंखा') || lower.includes('बिजली')) {
      const msg = language === 'hi' 
        ? 'इलेक्ट्रीशियन सेवा खोजी जा रही है। ₹350 का प्रस्ताव प्रसारित किया गया है।' 
        : 'Broadcasting electrician job offer at ₹350 initial budget.';
      setAiResponse(msg);
      speakText(msg);
      await postJobOffer({
        categoryId: 'electrician',
        problemDescription: 'Fan/Switchboard repair requested via Voice Assistant',
        initialBudget: 350,
        customerAddress: 'Pocket 4, Sector 15, Rohini, New Delhi',
        bookingType: 'INSTANT_SOS'
      });
      return;
    }

    // 3. Plumber booking
    if (lower.includes('plumber') || lower.includes('leak') || lower.includes('water') || lower.includes('नल') || lower.includes('प्लंबर') || lower.includes('पानी')) {
      const msg = language === 'hi'
        ? 'आपातकालीन प्लंबर सेवा खोजी जा रही है। ₹350 का प्रस्ताव भेजा गया है।'
        : 'Broadcasting emergency plumber offer at ₹350 budget.';
      setAiResponse(msg);
      speakText(msg);
      await postJobOffer({
        categoryId: 'plumber',
        problemDescription: 'Pipe leak fix requested via Voice Assistant',
        initialBudget: 350,
        customerAddress: 'Flat 301, Sector 9, Dwarka, New Delhi',
        bookingType: 'INSTANT_SOS'
      });
      return;
    }

    // 4. Caregiver booking
    if (lower.includes('care') || lower.includes('nurse') || lower.includes('elder') || lower.includes('केयर') || lower.includes('बुजुर्ग')) {
      const msg = language === 'hi'
        ? 'वरिष्ठ नागरिक देखभाल सहायक बुक किया जा रहा है।'
        : 'Cooperative senior care attendant request broadcasted.';
      setAiResponse(msg);
      speakText(msg);
      await postJobOffer({
        categoryId: 'caregiver',
        problemDescription: 'Elder care assistance requested via Voice Assistant',
        initialBudget: 650,
        customerAddress: 'A-84, Hauz Khas Enclave, New Delhi',
        bookingType: 'SCHEDULED'
      });
      return;
    }

    // Generic fallback
    const fallback = language === 'hi' 
      ? `मैंने सुना: "${command}"। कृपया बताएं कि आप इलेक्ट्रीशियन, प्लंबर या केयरगिवर में से क्या चाहते हैं?`
      : `Heard: "${command}". Would you like an Electrician, Plumber, Carpenter, or Caregiver?`;
    setAiResponse(fallback);
    speakText(fallback);
  };

  if (!voiceModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-zinc-200 relative overflow-hidden animate-in fade-in">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500" />

        <button
          onClick={() => setVoiceModalOpen(false)}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 bg-zinc-100 hover:bg-zinc-200 p-1.5 rounded-full transition-all"
          aria-label="Close voice assistant"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mt-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multilingual AI Voice Assistant</span>
          </div>
          <h3 className="text-xl font-black text-zinc-900">
            {language === 'hi' ? 'बोलें और सेवा बुक करें' : 'Speak to Book or Manage Service'}
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            {language === 'hi' 
              ? 'बिना टाइप किए अपनी भाषा में बोलकर तुरंत इलेक्ट्रीशियन, प्लंबर आदि बुक करें' 
              : 'Hands-free voice recognition for workers and citizens in Hindi and English'}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-6">
          <div className="relative flex items-center justify-center">
            {isListening && (
              <>
                <div className="absolute w-32 h-32 rounded-full bg-emerald-400/20 animate-ping" />
                <div className="absolute w-24 h-24 rounded-full bg-emerald-500/30 animate-pulse" />
              </>
            )}
            <button
              onClick={toggleListening}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 scale-110 shadow-red-500/30' 
                  : 'bg-emerald-600 hover:bg-emerald-700 hover:scale-105 shadow-emerald-500/30'
              }`}
            >
              {isListening ? (
                <MicOff className="w-8 h-8 animate-bounce" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>
          </div>

          <span className="text-xs font-semibold text-zinc-600 mt-4">
            {isListening 
              ? (language === 'hi' ? 'सुन रहा हूँ... बोलिए' : 'Listening... Speak now') 
              : (language === 'hi' ? 'माइक दबाकर बोलें' : 'Tap microphone to speak')}
          </span>
        </div>

        {transcript && (
          <div className="bg-zinc-50 rounded-2xl p-3 border border-zinc-200 mb-3 text-center">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block mb-1">You said</span>
            <p className="text-xs font-medium text-zinc-800 italic">"{transcript}"</p>
          </div>
        )}

        <div className="bg-emerald-50/80 rounded-2xl p-3.5 border border-emerald-200/80 mb-4 flex items-start gap-2.5">
          <Volume2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-emerald-900 block mb-0.5">SahakarSetu AI Voice</span>
            <p className="text-xs text-emerald-800 leading-relaxed">{aiResponse}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-zinc-400 block">
            {language === 'hi' ? 'त्वरित उदाहरण आजमाएं:' : 'Or tap a sample voice prompt:'}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => {
                const cmd = language === 'hi' ? 'पंखा रिपेयर के लिए इलेक्ट्रीशियन चाहिए' : 'Book an electrician for fan repair';
                setTranscript(cmd);
                handleVoiceCommand(cmd);
              }}
              className="text-left text-xs bg-zinc-100 hover:bg-emerald-50 hover:text-emerald-800 border border-zinc-200 hover:border-emerald-300 p-2 rounded-xl transition-all text-zinc-700 flex items-center justify-between"
            >
              <span>⚡ {language === 'hi' ? 'इलेक्ट्रीशियन बुक करें' : 'Book Electrician'}</span>
              <ArrowRight className="w-3 h-3 text-zinc-400" />
            </button>

            <button
              onClick={() => {
                const cmd = language === 'hi' ? 'पाइप लीकेज के लिए आपातकालीन प्लंबर' : 'Emergency plumber for pipe burst';
                setTranscript(cmd);
                handleVoiceCommand(cmd);
              }}
              className="text-left text-xs bg-zinc-100 hover:bg-emerald-50 hover:text-emerald-800 border border-zinc-200 hover:border-emerald-300 p-2 rounded-xl transition-all text-zinc-700 flex items-center justify-between"
            >
              <span>🚰 {language === 'hi' ? 'आपातकालीन प्लंबर' : 'Emergency Plumber'}</span>
              <ArrowRight className="w-3 h-3 text-zinc-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
