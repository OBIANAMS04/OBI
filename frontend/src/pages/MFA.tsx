import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

interface MFASetupData {
  secret: string;
  qrCode: string;
}

export const MFA = () => {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();

  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup');
  const [mfaData, setMfaData] = useState<MFASetupData | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  useEffect(() => {
    if (step === 'setup') {
      setupMFA();
    }
  }, [step]);

  const setupMFA = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.post('/mfa/setup', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMfaData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to setup MFA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!totpCode || totpCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    try {
      setIsLoading(true);

      if (!mfaData?.secret) {
        throw new Error('MFA secret not found');
      }

      await api.post(
        '/mfa/verify',
        {
          secret: mfaData.secret,
          totpCode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStep('complete');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid code. Please try again.');
      setTotpCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600">Please log in to set up MFA</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Set Up 2FA</h1>
          <p className="text-gray-600">Protect your account with two-factor authentication</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {step === 'setup' && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Generating QR code...</p>
              </div>
            ) : mfaData ? (
              <>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, Microsoft
                    Authenticator, etc.):
                  </p>
                  <div className="flex justify-center bg-white p-4 rounded">
                    <img src={mfaData.qrCode} alt="MFA QR Code" className="w-48 h-48" />
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Can't scan? Enter this code manually:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white p-2 rounded border border-gray-300 font-mono text-sm break-all">
                      {mfaData.secret}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(mfaData.secret)}
                      className="px-3 py-2 bg-primary-600 text-white rounded text-sm hover:bg-primary-700"
                      title="Copy to clipboard"
                    >
                      {copyFeedback ? '✓' : 'Copy'}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep('verify')}
                  className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Next: Verify Code
                </button>
              </>
            ) : null}
          </div>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label htmlFor="totpCode" className="block text-sm font-medium text-gray-700 mb-2">
                Enter the 6-digit code from your authenticator app
              </label>
              <input
                id="totpCode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-center text-2xl tracking-widest"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                The code changes every 30 seconds. Enter the current code shown in your app.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || totpCode.length !== 6}
              className={`w-full py-2 rounded-lg font-medium text-white transition-colors ${
                isLoading || totpCode.length !== 6
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              {isLoading ? 'Verifying...' : 'Verify & Enable 2FA'}
            </button>

            <button
              type="button"
              onClick={() => setStep('setup')}
              className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
          </form>
        )}

        {step === 'complete' && (
          <div className="space-y-6">
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <div className="text-4xl mb-2">✅</div>
              <h2 className="text-xl font-bold text-green-900 mb-2">2FA Enabled!</h2>
              <p className="text-green-800 text-sm">
                Your account is now protected with two-factor authentication. You'll need to enter a code from your
                authenticator app when you log in.
              </p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-yellow-900 mb-2">🔐 Important:</p>
              <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                <li>Save your secret code somewhere safe</li>
                <li>Keep your authenticator app installed</li>
                <li>You'll need it every time you log in</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Back to Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MFA;
