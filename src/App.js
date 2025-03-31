import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';
import './App.css';

function App() {
  // 状態管理
  const [activeNote, setActiveNote] = useState(null);
  const [visualEffect, setVisualEffect] = useState('circle');
  const [effects, setEffects] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // 画面サイズの変更を検知
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // オーディオの初期化
  useEffect(() => {
    const initAudio = async () => {
      try {
        await Tone.start();
        console.log('オーディオ初期化完了');
      } catch (error) {
        console.error('オーディオの初期化に失敗しました:', error);
      }
    };
    
    initAudio();
  }, []);
  
  // 音を鳴らす
  const playNote = (note) => {
    try {
      if (!Tone) return;
      
      // 一時的なシンセを作成して音を鳴らす
      const synth = new Tone.Synth().toDestination();
      synth.triggerAttackRelease(note, '0.5s');
      
      // メモリリーク防止
      setTimeout(() => synth.dispose(), 1000);
      
      // アクティブノートを設定
      setActiveNote(note);
      
      // 視覚エフェクトを作成
      createVisualEffect(note);
      
      // 1秒後にアクティブノートをリセット
      setTimeout(() => setActiveNote(null), 1000);
    } catch (error) {
      console.error('音の再生に失敗しました:', error);
    }
  };
  
  // ドラム音を鳴らす
  const playDrum = (drumType) => {
    try {
      if (!Tone) return;
      
      let synth;
      
      switch (drumType) {
        case 'kick':
          synth = new Tone.MembraneSynth().toDestination();
          synth.triggerAttackRelease('C1', '0.1s');
          break;
        case 'snare':
          synth = new Tone.NoiseSynth().toDestination();
          synth.triggerAttackRelease('16n');
          break;
        case 'hihat':
          synth = new Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: { decay: 0.05 }
          }).toDestination();
          synth.triggerAttackRelease('32n');
          break;
        case 'cymbal':
          synth = new Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: { decay: 1.5 }
          }).toDestination();
          synth.triggerAttackRelease('8n');
          break;
        default:
          return;
      }
      
      // メモリリーク防止
      setTimeout(() => synth.dispose(), 2000);
      
      // アクティブノートを設定
      setActiveNote(drumType);
      
      // 視覚エフェクトを作成
      createVisualEffect(drumType);
      
      // 1秒後にアクティブノートをリセット
      setTimeout(() => setActiveNote(null), 1000);
    } catch (error) {
      console.error('ドラム音の再生に失敗しました:', error);
    }
  };
  
  // 視覚エフェクトを作成
  const createVisualEffect = (triggerName) => {
    // 画面サイズに基づいたサイズ設定
    const maxSize = isMobile ? 60 : 100;
    const minSize = isMobile ? 20 : 50;
    
    // ランダムな値を生成
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
    const randomSize = Math.floor(Math.random() * (maxSize - minSize)) + minSize;
    
    // エフェクト位置 - 画面からはみ出ないよう調整
    const padding = randomSize / 2; // エフェクトがはみ出さないようにパディングを追加
    const maxX = 100 - (padding / 5);
    const maxY = 100 - (padding / 3);
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);
    
    // 新しいエフェクトを作成
    const newEffect = {
      id: Date.now(),
      note: triggerName,
      color: randomColor,
      size: randomSize,
      x: `${randomX}%`,
      y: `${randomY}%`,
      type: visualEffect
    };
    
    // エフェクトを追加（最大10個に制限し、パフォーマンスを改善）
    setEffects(prev => {
      const filtered = prev.filter(effect => effect.id !== newEffect.id);
      return [newEffect, ...filtered].slice(0, 10);
    });
    
    // 1秒後にエフェクトを削除
    setTimeout(() => {
      setEffects(prev => prev.filter(effect => effect.id !== newEffect.id));
    }, 1000);
  };
  
  // 音階の配列
  const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
  
  return (
    <div className="app">
      <h1 className="app-title">TapSound</h1>
      
      <div className="main-content">
        {/* コントロールと楽器を含むコンテナ */}
        <div className="controls-and-instruments">
          {/* コントロールパネル */}
          <div className="control-panel">
            <div className="control-group">
              <label className="control-label">形:</label>
              <select 
                value={visualEffect} 
                onChange={(e) => setVisualEffect(e.target.value)}
                className="control-select"
              >
                <option value="circle">円</option>
                <option value="square">四角</option>
                <option value="triangle">三角</option>
              </select>
            </div>
          </div>

          <p className="instruction">画面の要素をクリックまたはタップして音を鳴らしてみましょう！</p>
          
          {/* 鍵盤 */}
          <div className="keyboard">
            {notes.map((note) => (
              <button
                key={note}
                className={`key ${activeNote === note ? 'key-active' : ''}`}
                onClick={() => playNote(note)}
              >
                {note}
              </button>
            ))}
          </div>
          
          {/* ドラムパッド */}
          <div className="drum-pads">
            <button
              className={`drum-pad drum-pad-kick ${activeNote === 'kick' ? 'drum-pad-active' : ''}`}
              onClick={() => playDrum('kick')}
            >
              キック
            </button>
            <button
              className={`drum-pad drum-pad-snare ${activeNote === 'snare' ? 'drum-pad-active' : ''}`}
              onClick={() => playDrum('snare')}
            >
              スネア
            </button>
            <button
              className={`drum-pad drum-pad-hihat ${activeNote === 'hihat' ? 'drum-pad-active' : ''}`}
              onClick={() => playDrum('hihat')}
            >
              ハイハット
            </button>
            <button
              className={`drum-pad drum-pad-cymbal ${activeNote === 'cymbal' ? 'drum-pad-active' : ''}`}
              onClick={() => playDrum('cymbal')}
            >
              シンバル
            </button>
          </div>
        </div>
        
        {/* エフェクト表示エリアのコンテナ */}
        <div className="effect-display-container">
          {/* 視覚エフェクト表示エリア */}
          <div className="effect-display">
            <div className="effect-label">図形表示エリア</div>
            
            {effects.map((effect) => {
              if (effect.type === 'circle') {
                return (
                  <div
                    key={effect.id}
                    className="effect effect-circle"
                    style={{
                      backgroundColor: effect.color,
                      width: effect.size + 'px',
                      height: effect.size + 'px',
                      left: effect.x,
                      top: effect.y,
                      transform: `translate(-${effect.size / 2}px, -${effect.size / 2}px)` // 中心点からの配置に修正
                    }}
                  />
                );
              } else if (effect.type === 'square') {
                return (
                  <div
                    key={effect.id}
                    className="effect effect-square"
                    style={{
                      backgroundColor: effect.color,
                      width: effect.size + 'px',
                      height: effect.size + 'px',
                      left: effect.x,
                      top: effect.y,
                      transform: `translate(-${effect.size / 2}px, -${effect.size / 2}px) rotate(45deg)` // 中心点からの配置に修正
                    }}
                  />
                );
              } else if (effect.type === 'triangle') {
                const halfSize = effect.size / 2;
                return (
                  <div
                    key={effect.id}
                    className="effect effect-triangle"
                    style={{
                      borderLeft: `${halfSize}px solid transparent`,
                      borderRight: `${halfSize}px solid transparent`,
                      borderBottom: `${effect.size}px solid ${effect.color}`,
                      left: effect.x,
                      top: effect.y,
                      transform: `translate(-${halfSize}px, -${halfSize}px)` // 中心点からの配置に修正
                    }}
                  />
                );
              }
              
              return null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;