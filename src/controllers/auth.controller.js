import { AuthService } from "../services/auth.service.js";
import { sha256OfObject } from "../utils/hash.js";
import ChatRoom from "../models/ChatRoom.js";
import axios from "axios";
import Patient from "../models/Patient.js"; // Make sure this path is correct
import Report from "../models/Report.js";

// Register new user
export const register = async (req, res, next) => {
  try {
    const { email, password, doctor, hospital, role = 'patient', bloodGroup, gender, ...entityData } = req.body;
    const blockchainHash = sha256OfObject({ ...req.body });

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Email, password are required",
      });
    }

    // Validate role
    const validRoles = ["patient", "doctor", "hospital"];
    // if (!validRoles.includes(role)) {
    //   return res.status(400).json({
    //     ok: false,
    //     message: "Invalid role. Must be one of: patient, doctor, hospital",
    //   });
    // }
    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        ok: false,
        message: "Password must be at least 6 characters long",
      });
    }
    console.log("req.body-----=-=--=--=-=-==-=-=-", req.body, doctor, hospital)
    const result = await AuthService.register(
      { email, password, bloodGroup, gender },
      entityData,
      role,
      blockchainHash,
      doctor,
      hospital
    );

    res.status(201).json({
      ok: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Email and password are required",
      });
    }

    const result = await AuthService.login(email, password);

    res.json({
      ok: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
export const getProfile = async (req, res, next) => {
  try {
    const user = await AuthService.getCurrentUser(req.user.id);

    res.json({
      ok: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProfile = async (req, res, next) => {
  try {
    const result = await AuthService.deleteProfile(req.params.id);

    res.json({
      ok: true,
      message: 'Profile deleted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


// Update user profile
export const updateProfile = async (req, res, next) => {
  try {
    const user = await AuthService.updateProfile(req.params.id, { ...req?.body });

    res.json({
      ok: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Change password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        ok: false,
        message: "Current password and new password are required",
      });
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        ok: false,
        message: "New password must be at least 6 characters long",
      });
    }

    await AuthService.changePassword(req.user.id, currentPassword, newPassword);

    res.json({
      ok: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Forgot password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        ok: false,
        message: "Email is required",
      });
    }

    const result = await AuthService.forgotPassword(email);

    res.json({
      ok: true,
      message: "Password reset instructions sent to email",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Reset password
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        ok: false,
        message: "Token and new password are required",
      });
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        ok: false,
        message: "New password must be at least 6 characters long",
      });
    }

    await AuthService.resetPassword(token, newPassword);

    res.json({
      ok: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Refresh token
export const refreshToken = async (req, res, next) => {
  try {
    const result = await AuthService.refreshToken(req.user.id);

    res.json({
      ok: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Logout
export const logout = async (req, res, next) => {
  try {
    await AuthService.logout(req.user.id);

    res.json({
      ok: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get user by wallet address
export const getUserByWallet = async (req, res, next) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress) {
      return res.status(400).json({
        ok: false,
        message: "Wallet address is required",
      });
    }

    const user = await AuthService.getUserByWallet(walletAddress);

    res.json({
      ok: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Verify token (for client-side token validation)
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        ok: false,
        message: "Token is required",
      });
    }

    const decoded = AuthService.verifyToken(token);
    const user = await AuthService.getCurrentUser(decoded.id);

    res.json({
      ok: true,
      data: {
        valid: true,
        user,
      },
    });
  } catch (error) {
    res.status(401).json({
      ok: false,
      message: "Invalid or expired token",
      data: {
        valid: false,
      },
    });
  }
};

// Chat - Handle patient message and update chat room
// export const handlePatientMessage = async (req, res, next) => {
//   try {
//     const { patientId, inputtext } = req.body;

//     if (!patientId || !inputtext) {
//       return res.status(400).json({ ok: false, message: 'patientId and inputtext are required' });
//     }

//     // Step 1: Find or create the chat room
//     let chatRoom = await ChatRoom.findOne({ patient: patientId });

//     if (!chatRoom) {
//       chatRoom = new ChatRoom({
//         patient: patientId,
//         conversation: []
//       });
//     }

//     // Step 2: Add new inputtext
//     const newMessage = {
//       inputtext,
//       timestamp: new Date()
//     };
//     chatRoom.conversation.push(newMessage);

//     // // Step 3: Call third-party API
//     // const response = await axios.post('https://third-party-api.com/process', {
//     //   conversation: chatRoom.conversation
//     // });

//     const response = {
//       data: {
//         outputtext: "Hello Welcome HelathSync.io",
//         summary: "This is Summary"
//       }
//     }

//     // const { outputtext, summary } = response.data;
//     const { outputtext, summary } = response.data;

//     // Step 4: Update outputtext and summary
//     const lastIndex = chatRoom.conversation.length - 1;
//     chatRoom.conversation[lastIndex].outputtext = outputtext;
//     chatRoom.summary = summary;

//     // Step 5: Save updated chat room
//     await chatRoom.save();

//     // Step 6: Send response
//     res.json({
//       ok: true,
//       message: 'Chat updated successfully',
//       data: {
//         summary: chatRoom.summary,
//         conversation: chatRoom.conversation
//       }
//     });

//   } catch (error) {
//     next(error); // Use centralized error handler
//   }
// };

// Handle patient message and update chat room
export const handlePatientMessage = async (req, res, next) => {
  try {
    const { patientId, inputtext } = req.body;

    if (!patientId || !inputtext) {
      return res
        .status(400)
        .json({ ok: false, message: "patientId and inputtext are required" });
    }
    // ✅ Step 0: Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ ok: false, message: "Patient not found" });
    }

    // Step 1: Find or create the chat room
    let chatRoom = await ChatRoom.findOne({ patient: patientId });

    if (!chatRoom) {
      chatRoom = new ChatRoom({
        patient: patientId,
        conversation: [],
        summary: "",
        patientDetails: {}, // Initialize empty
      });
    }

    // Step 2: Push patient's message to conversation
    const newMessage = {
      inputtext,
      timestamp: new Date(),
    };
    chatRoom.conversation.push(newMessage);

    // Step 3: Format conversation as chat_history for third-party API
    const chatHistory = chatRoom.conversation.flatMap((msg) => {
      const history = [];
      if (msg.inputtext) {
        history.push({ role: "user", content: msg.inputtext });
      }
      if (msg.outputtext) {
        history.push({ role: "assistant", content: msg.outputtext });
      }
      return history;
    });

    const payload = {
      chat_history: chatHistory,
      asked_for_pid: true,
      patient_state: {
        assistant_reply:
          chatRoom.conversation[chatRoom.conversation.length - 2]?.outputtext ||
          "",
        conversationSummary: chatRoom.summary || "",
        patientDetails: { ...chatRoom.patientDetails, pid: patientId } || {},
      },
    };
    console.log("PAYLOAD", payload);

    // Step 4: Call third-party chatbot API
    const apiResponse = await axios.post(
      "https://webashalarforml-patient-bot.hf.space/chat",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
      }
    );
    console.log("apiResponse.data", apiResponse.data);
    const { assistant_reply, updated_state } = apiResponse.data;

    // Step 5: Update last message with outputtext
    const lastIndex = chatRoom.conversation.length - 1;
    chatRoom.conversation[lastIndex].outputtext = assistant_reply;

    // Step 6: Update summary
    // ✅ Step 6: Update summary and patientDetails in DB
    if (updated_state.conversationSummary) {
      chatRoom.summary = updated_state.conversationSummary;
    }
    if (updated_state.patientDetails) {
      chatRoom.patientDetails = updated_state.patientDetails;
    }

    // Optional: Save patientDetails somewhere if needed

    // Step 7: Save updated chat room
    await chatRoom.save();

    // Step 8: Respond with updated data
    res.json({
      ok: true,
      message: "Chat updated successfully",
      data: {
        summary: chatRoom.summary,
        conversation: chatRoom.conversation,
        patientDetails: chatRoom.patientDetails,
      },
    });
  } catch (error) {
    console.error("Error in chat handler:", error.message);
    next(error);
  }
};

// Get current user chat history
export const getChatHistory = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    if (!patientId) {
      return res
        .status(400)
        .json({ ok: false, message: "patientId is required" });
    }

    const chatRoom = await ChatRoom.findOne({ patient: patientId }).lean();

    if (!chatRoom) {
      return res
        .status(404)
        .json({ ok: false, message: "No chat history found for this patient" });
    }

    res.json({
      ok: true,
      message: "Chat history retrieved successfully",
      data: {
        summary: chatRoom.summary || "",
        conversation: chatRoom.conversation || [],
        patientDetails: chatRoom.patientDetails || {},
      },
    });
  } catch (error) {
    console.error("Get Chat History Error:", error.message);
    next(error);
  }
};

// export const reportAnalyseData = async (req, res, next) => {
//   try {
//     const { patientId, fromDate, toDate } = req.body;

//     // Fetch reports within date range
//     const reports = await Report.find({
//       patient: patientId,
//       reportDate: {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate)
//       },
//       reportFileName: { $ne: null }
//     });

//     if (reports.length === 0) {
//       return res.status(404).json({ message: "No reports found." });
//     }

//     // Extract file names from URLs
//     const fileNames = reports.map(r => {
//       if (r.reportFileName) {
//         return r.reportFileName // Get "CBC.pdf" from URL
//       }
//     }).filter(Boolean);

//     console.log("fileNames", fileNames)
//     const payload = {
//       patient_id: patientId, // Or a mapped patient code like "p_1234"
//       filenames: fileNames
//     };
//     console.log("payload", payload)

//     // Call external API
//     const response = await axios.post(
//       'https://webashalarforml-health-doc.hf.space/process_reports',
//       payload,
//       {
//         headers: {
//           'accept': '*/*',
//           'content-type': 'application/json',
//           'origin': 'https://webashalarforml-health-doc.hf.space',
//           'referer': 'https://webashalarforml-health-doc.hf.space/',
//           'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
//         }
//       }
//     );

//     // Step 4: Call third-party chatbot API
//     // const apiResponse = await axios.post('https://webashalarforml-patient-bot.hf.space/chat', payload, {
//     //   headers: {
//     //     'Content-Type': 'application/json',
//     //     'Accept': '*/*'
//     //   }
//     // });
//     console.log("-----------response----------", response)
//     return res.status(200).json({
//       success: true,
//       reportNames: fileNames,
//       data: response.data
//     });

//   } catch (error) {
//     console.error("Analysis API Error:", error.message);
//     return res.status(500).json({
//       message: error.message,
//       stack: error.stack
//     });
//   }
// };

import path from "path";

export const reportAnalyseData = async (req, res, next) => {
  try {
    const { patientId, fromDate, toDate } = req.body;

    // // Fetch reports within date range
    // const reports = await Report.find({
    //   patient: patientId,
    //   reportDate: {
    //     $gte: new Date(fromDate),
    //     $lte: new Date(toDate),
    //   },
    //   reportFileName: { $ne: null },
    // });

    // Build query based on presence of fromDate and toDate
    const query = {
      patient: patientId,
      reportFileName: { $ne: null },
    };

    if (fromDate && toDate) {
      query.reportDate = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }

    // Fetch reports
    const reports = await Report.find(query);

    if (reports.length === 0) {
      return res.status(404).json({ message: "No reports found." });
    }

    // Extract just the filenames (basename) from URLs or strings
    let fileNames = reports
      .map((r) => {
        if (r.reportFileName) {
          // This will extract filename from URL or path
          return path.basename(r.reportFileName);
        }
      })
      .filter(Boolean);

    // Remove duplicates
    fileNames = [...new Set(fileNames)];

    // Debug log
    console.log("Unique fileNames sent to external API:", fileNames);

    const payload = {
      patient_id: patientId, // Or mapped patient code if needed
      filenames: fileNames,
    };

    // Call external API
    const response = await axios.post(
      "https://webashalarforml-health-doc.hf.space/process_reports",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
      }
    );

    console.log("Response from external API:", response.data);

    return res.status(200).json({
      success: true,
      reportNames: fileNames,
      data: response.data,
    });
  } catch (error) {
    console.error("Analysis API Error:", error.message);

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Response Data:", error.response.data);
    }

    return res.status(500).json({
      message: error.message,
      stack: error.stack,
    });
  }
};
