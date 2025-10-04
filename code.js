function activate() {
  fetch("codes.json")
    .then(res => res.json())
    .then(data => {
      const validCodes = data.codes;
      if (validCodes.includes(realActivationCode)) {
        updateStatus("Code valid, activating...", "success");
        // proceed...
      } else {
        updateStatus("Invalid activation code", "error");
      }
    });
}
