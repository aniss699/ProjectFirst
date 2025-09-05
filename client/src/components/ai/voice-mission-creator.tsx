
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Play, Pause, Download } from 'lucide-react';

export function VoiceMissionCreator() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await sendToTranscription(audioBlob);
        audioChunksRef.current = [];
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendToTranscription = async (audioBlob: Blob) => {
    // Simulation - à remplacer par appel API réel
    setTimeout(() => {
      setTranscript("Je souhaite développer une application mobile pour la gestion de tâches. L'app doit être disponible sur iOS et Android, avec synchronisation cloud et notifications push. Budget autour de 5000 euros.");
    }, 2000);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="w-5 h-5" />
          Créer par dictée vocale
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            variant={isRecording ? "destructive" : "default"}
            size="lg"
            className="w-32 h-32 rounded-full"
          >
            {isRecording ? (
              <MicOff className="w-8 h-8" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </Button>
          <p className="mt-2 text-sm text-gray-600">
            {isRecording ? "Enregistrement en cours..." : "Appuyez pour enregistrer"}
          </p>
        </div>

        {transcript && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Transcription :</h4>
            <p className="text-sm">{transcript}</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline">
                <Play className="w-4 h-4 mr-2" />
                Réécouter
              </Button>
              <Button size="sm">
                Convertir en mission
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
