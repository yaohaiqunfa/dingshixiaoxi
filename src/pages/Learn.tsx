import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Mic, Play, Volume2, Check, ArrowRight, RotateCcw } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function Learn() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const completeModule = useStore((state) => state.completeModule);
  const course = useStore((state) => state.courses.find((c) => c.id === courseId));
  const mod = course?.modules.find((m) => m.id === moduleId);

  const [step, setStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // Mock data for different module types
  const vocabCards = [
    { word: 'Hello', meaning: '你好', example: 'Hello, how are you?' },
    { word: 'Goodbye', meaning: '再见', example: 'Goodbye, see you tomorrow.' },
    { word: 'Thank you', meaning: '谢谢', example: 'Thank you for your help.' },
  ];

  const speakingSentences = [
    { text: 'Excuse me, where is the nearest airport?', translation: '打扰一下，最近的机场在哪里？' },
    { text: 'I would like to order a cup of coffee.', translation: '我想点一杯咖啡。' },
  ];

  const totalSteps = mod?.type === 'vocabulary' ? vocabCards.length : speakingSentences.length;

  useEffect(() => {
    if (!mod) navigate('/courses');
  }, [mod, navigate]);

  if (!mod) return null;

  const handleNext = () => {
    setIsFlipped(false);
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      const finalScore = Math.floor(Math.random() * 20) + 80; // Mock score 80-100
      setScore(finalScore);
      setShowResult(true);
      completeModule(courseId!, moduleId!, finalScore);
    }
  };

  const renderVocabulary = () => {
    const card = vocabCards[step];
    return (
      <div className="flex flex-col items-center justify-center flex-1 space-y-12">
        <h2 className="text-2xl font-bold text-slate-700 mb-8">单词记忆</h2>
        
        <div 
          className="relative w-full max-w-md aspect-[4/3] perspective-1000 cursor-pointer"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <motion.div
            className="w-full h-full relative preserve-3d"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            {/* Front */}
            <div className="absolute w-full h-full backface-hidden bg-white rounded-3xl shadow-xl border-2 border-slate-100 flex flex-col items-center justify-center p-8 text-center hover:border-blue-200 transition-colors">
              <span className="text-5xl font-extrabold text-slate-900 mb-6">{card.word}</span>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-widest flex items-center gap-2">
                点击卡片翻转 <RotateCcw className="w-4 h-4" />
              </p>
            </div>
            
            {/* Back */}
            <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-xl border-2 border-transparent flex flex-col items-center justify-center p-8 text-center text-white" style={{ transform: 'rotateY(180deg)' }}>
              <span className="text-4xl font-bold mb-6">{card.meaning}</span>
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20 w-full">
                <p className="text-lg font-light italic">"{card.example}"</p>
              </div>
            </div>
          </motion.div>
        </div>

        <button 
          onClick={handleNext}
          className={clsx(
            "flex items-center gap-2 px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 transform",
            isFlipped 
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:-translate-y-1" 
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          )}
          disabled={!isFlipped}
        >
          {step === totalSteps - 1 ? '完成练习' : '下一个单词'} <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  const renderSpeaking = () => {
    const sentence = speakingSentences[step];
    return (
      <div className="flex flex-col items-center justify-center flex-1 space-y-10 w-full max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-700 mb-4">口语跟读</h2>
        
        <div className="bg-white w-full p-10 rounded-3xl shadow-lg border border-slate-100 text-center">
          <div className="flex justify-center mb-6">
            <button className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors">
              <Volume2 className="w-6 h-6" />
            </button>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mb-4 leading-tight">{sentence.text}</p>
          <p className="text-lg text-slate-500 font-medium">{sentence.translation}</p>
        </div>

        <div className="flex flex-col items-center space-y-6">
          <button
            onMouseDown={() => setIsRecording(true)}
            onMouseUp={() => setIsRecording(false)}
            onMouseLeave={() => setIsRecording(false)}
            className={clsx(
              "relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300",
              isRecording 
                ? "bg-red-500 text-white shadow-[0_0_40px_rgba(239,68,68,0.6)] scale-110" 
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
            )}
          >
            {isRecording && (
              <span className="absolute w-full h-full rounded-full border-4 border-red-400 animate-ping"></span>
            )}
            <Mic className={clsx("w-10 h-10", isRecording && "animate-pulse")} />
          </button>
          <p className="text-slate-500 font-medium">长按按钮进行录音跟读</p>
        </div>

        <button 
          onClick={handleNext}
          className="flex items-center gap-2 px-10 py-4 rounded-full bg-slate-900 text-white hover:bg-black shadow-md font-bold text-lg transition-transform hover:-translate-y-1"
        >
          {step === totalSteps - 1 ? '查看得分' : '下一句'} <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-4 w-1/3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-lg text-slate-900 truncate hidden sm:block">{mod.title}</h1>
        </div>
        
        <div className="flex-1 flex justify-center max-w-md w-full px-4">
          <div className="w-full bg-slate-100 rounded-full h-3">
            <motion.div 
              className="bg-green-500 h-3 rounded-full shadow-inner"
              initial={{ width: 0 }}
              animate={{ width: `${((step) / totalSteps) * 100}%` }}
              transition={{ duration: 0.5 }}
            ></motion.div>
          </div>
        </div>

        <div className="w-1/3 text-right text-sm font-bold text-slate-500">
          <span className="text-slate-900">{step + 1}</span> / {totalSteps}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex items-center justify-center p-6 relative">
        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="w-full flex justify-center h-full items-center"
            >
              {mod.type === 'vocabulary' ? renderVocabulary() : renderSpeaking()}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[3rem] p-12 text-center shadow-2xl border border-slate-100 max-w-lg w-full relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 opacity-50"></div>
              <div className="relative z-10">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-500/30">
                  <Check className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-4xl font-extrabold text-slate-900 mb-4">太棒了！</h2>
                <p className="text-xl text-slate-600 mb-8 font-medium">你已完成本节练习</p>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-10 shadow-sm border border-slate-100">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">综合得分</p>
                  <p className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600">
                    {score}
                  </p>
                </div>

                <button 
                  onClick={() => navigate(`/courses/${courseId}`)}
                  className="w-full py-4 bg-slate-900 text-white rounded-full font-bold text-lg hover:bg-black transition-colors shadow-lg"
                >
                  返回课程详情
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
