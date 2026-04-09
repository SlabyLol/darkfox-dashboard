// --- CORE TERMINAL ACTIONS ---
  const handleLogin = async () => {
    if (!email || !password) {
      addSystemLog("AUTH_ERROR: Missing credentials.");
      return;
    }
    
    setIsConnecting(true);
    addSystemLog("INITIATING HANDSHAKE...");
    
    // Kleiner Delay für Terminal-Feeling
    setTimeout(async () => {
      const users = getRailwayUsers();
      
      if (users.length === 0) {
        addSystemLog("CRITICAL_ERROR: NO USER_DATA FOUND.");
        setIsConnecting(false);
        return;
      }

      // CRITICAL FIX: Abgleich mit u.pw statt u.password inkl. String-Konvertierung
      const foundUser = users.find(
        (u: any) => u.email.toLowerCase() === email.toLowerCase() && String(u.pw) === String(password)
      );

      if (foundUser) {
        const userKey = foundUser.email.replace(/\./g, ',');
        const initialData = { 
          ...foundUser, 
          status: "ONLINE",
          lastSeen: serverTimestamp(),
          currentMission: foundUser.role === "ADMIN" ? "Overseeing Operations" : "Awaiting Orders" 
        };
        
        try {
          await set(ref(db, `users/${userKey}`), initialData);
          setUser(initialData);
          setIsLogged(true);
          addSystemLog(`AUTH_SUCCESS: Welcome ${foundUser.name}.`);
        } catch (dbError) {
          console.error("DATABASE_ERROR:", dbError);
          addSystemLog("DATABASE_FAIL: Check Firebase permissions.");
          alert("DATABASE ERROR: Connection to Firebase failed.");
        }
      } else {
        addSystemLog("AUTH_FAILURE: Access Keys invalid.");
        alert("UNAUTHORIZED: Check your credentials.");
      }
      setIsConnecting(false);
    }, 800);
  };
