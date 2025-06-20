import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  PoundSterling,
  Download,
  Building,
  Phone,
  Mail,
  Globe
} from "lucide-react";
import { FitnessSessionWithDetails } from "@shared/schema";

interface BookingConfirmationProps {
  sessionId: string;
  paymentIntentId: string;
}

export default function BookingConfirmation() {
  const [sessionId, setSessionId] = useState<string>("");
  const [paymentIntentId, setPaymentIntentId] = useState<string>("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sid = urlParams.get('session_id') || "";
    const piid = urlParams.get('payment_intent');
    
    setSessionId(sid);
    setPaymentIntentId(piid || "");
  }, []);

  const { data: session } = useQuery<FitnessSessionWithDetails>({
    queryKey: ["/api/sessions", sessionId],
    enabled: !!sessionId,
  });

  if (!session) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleDownloadReceipt = () => {
    // Generate a simple receipt
    const receiptData = `
MYLES - Booking Confirmation
=============================

Session: ${session.title}
Business: ${session.business.name}
Date: ${new Date().toLocaleDateString()}
Price: £${session.price}
Payment ID: ${paymentIntentId}

Thank you for booking with MYLES!
    `;
    
    const blob = new Blob([receiptData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `myles-booking-${sessionId}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Booking Confirmed!</h1>
          <p className="text-neutral-600">
            Your fitness session has been successfully booked. Check your email for confirmation details.
          </p>
        </div>

        {/* Booking Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Session Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{session.title}</h3>
              <p className="text-neutral-600">{session.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-neutral-500" />
                <span>{session.business.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-neutral-500" />
                <span>{session.business.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-neutral-500" />
                <span>{session.duration} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-neutral-500" />
                <span>Max {session.maxParticipants} participants</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-lg font-semibold">Total Paid:</span>
              <div className="flex items-center gap-1">
                <PoundSterling className="w-5 h-5" />
                <span className="text-xl font-bold">{session.price}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Session Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {session.schedule && Array.isArray(session.schedule) ? 
                session.schedule.map((slot: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <span className="font-medium">
                      {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][slot.dayOfWeek]}
                    </span>
                    <span>{slot.startTime} - {slot.endTime}</span>
                  </div>
                )) : (
                <p className="text-neutral-600">Schedule details will be confirmed by the business.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Business Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {session.business.phone && (
              <div className="flex items-center gap-2">
                <span>📞</span>
                <span>{session.business.phone}</span>
              </div>
            )}
            {session.business.email && (
              <div className="flex items-center gap-2">
                <span>✉️</span>
                <span>{session.business.email}</span>
              </div>
            )}
            {session.business.website && (
              <div className="flex items-center gap-2">
                <span>🌐</span>
                <a href={session.business.website} target="_blank" rel="noopener noreferrer" 
                   className="text-primary hover:underline">
                  Visit Website
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleDownloadReceipt} variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Download Receipt
          </Button>
          <Button 
            onClick={() => window.location.href = '/'}
            className="flex-1"
          >
            Back to Home
          </Button>
        </div>

        {/* Important Notes */}
        <Card className="mt-6 border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-amber-800 mb-2">Important Notes:</h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Please arrive 10 minutes early for your session</li>
              <li>• Bring appropriate workout gear and water</li>
              <li>• Contact the business directly for any changes or cancellations</li>
              <li>• Check your email for detailed joining instructions</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}