import { Facebook, Twitter, Instagram, Linkedin, Bug } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import BugReportModal from './BugReportModal';

export default function Footer() {
  const { isAuthenticated } = useAuth();
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);

  return (
    <>
      <div className="py-10 px-4 sm:px-6 bg-[#F5F5F5] md:px-10 lg:px-20 xl:px-40">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-3 text-center sm:text-left">
          <div>
            <h2 className="text-lg font-bold">About Us</h2>
            <div className="mt-2">
              <p className="text-gray-400">About</p>
              <p className="text-gray-400">Careers</p>
              <p className="text-gray-400">Press</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold">Support</h2>
            <div className="mt-2">
              <p className="text-gray-400">Help Center</p>
              <p className="text-gray-400">Safety Center</p>
              <p className="text-gray-400">Contact Us</p>
              {isAuthenticated && (
                <button
                  onClick={() => setIsBugModalOpen(true)}
                  className="text-gray-400 hover:text-red-600 transition-colors flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto"
                >
                  <Bug size={16} />
                  Report a Bug
                </button>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold">Legal</h2>
            <div className="mt-2">
              <p className="text-gray-400">Privacy Policy</p>
              <p className="text-gray-400">Terms of Use</p>
              <p className="text-gray-400">Cookie Policy</p>
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-start">
            <h2 className="text-lg font-bold">Follow Us</h2>
            <div className="flex gap-3 mt-2 justify-center sm:justify-start">
              <Facebook className="text-primary" />
              <Twitter className="text-primary" />
              <Instagram className="text-primary" />
              <Linkedin className="text-primary" />
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-10">
          <p className="text-gray-400">@ 2025 Zelzec.com All rights reserved</p>
        </div>
      </div>

      <BugReportModal
        isOpen={isBugModalOpen}
        onClose={() => setIsBugModalOpen(false)}
      />
    </>
  );
}