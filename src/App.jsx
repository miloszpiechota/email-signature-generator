import { useState, useEffect } from "react";
import "./App.css";
import rexLogoInline from "./assets/rex_logo_icon.png?inline";
import bkLogoInline from "./assets/bk_logo.png?inline";
import popeyesLogoInline from "./assets/popeyes_logo.png?inline";
import phoneIconInline from "./assets/phone_icon.png?inline";
import emailIconInline from "./assets/email_icon.png?inline";
import linkedinIconInline from "./assets/linkedin_icon.png?inline";
import locationIconInline from "./assets/location_icon.png?inline";

function App() {
  const [signatureHTML, setSignatureHTML] = useState("");
  const [templates, setTemplates] = useState({});
  const [form, setForm] = useState({
    name: "",
    surname: "",
    position: "",
    phone: "",
    email: "",
    templateId: 1,
    country: "Poland",
  });
  const countryCodes = {
    Poland: "+48",
    "Czech Republic": "+420",
    Romania: "+40",
  };
  const assetInlineMap = {
    "rex_logo_icon.png": rexLogoInline,
    "bk_logo.png": bkLogoInline,
    "popeyes_logo.png": popeyesLogoInline,
    "phone_icon.png": phoneIconInline,
    "email_icon.png": emailIconInline,
    "linkedin_icon.png": linkedinIconInline,
    "location_icon.png": locationIconInline,
  };

  useEffect(() => {
    const loadTemplate = async () => {
      const templateIds = [1, 2, 3];
      const loadedTemplates = {};
      for (const id of templateIds) {
        const res = await fetch(`${import.meta.env.BASE_URL}templates/template${id}.html`);
        const text = await res.text();
        loadedTemplates[id] = text;
      }
      setTemplates(loadedTemplates);
    };
    loadTemplate();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const nameRegex = /^[\p{L} -]+$/u;
    const phoneRegex = /^\d{9}$/;
    const emailRegex = /^[^\s@]+@rc-cee\.com$/i;

    const requiredFields = ["name", "surname", "position", "phone", "email"];

    // check for empty fields
    for (const field of requiredFields) {
      if (!form[field].trim()) {
        alert(`Please fill in the "${field}" field.`);
        return false;
      }
    }

    if (!nameRegex.test(form.name)) {
      alert(
        "First name must contain only letters (no digits/special characters)."
      );
      return false;
    }

    if (!nameRegex.test(form.surname)) {
      alert(
        "Last name must contain only letters (no digits/special characters)."
      );
      return false;
    }

    if (!phoneRegex.test(form.phone)) {
      alert("Phone number must be exactly 9 digits.");
      return false;
    }

    if (!emailRegex.test(form.email)) {
      alert("Email must end with @rc-cee.com");
      return false;
    }

    return true;
  };

  const handleGenerate = async () => {
    if (!validateForm()) return;
    let html = templates[form.templateId];
    if (!html) return;
    const resolvedBase = new URL(
      import.meta.env.BASE_URL || "/",
      window.location.origin
    );
    const assetBase = new URL("assets/", resolvedBase).href;
    html = html
      .replace(/{{assetBase}}([^"']+)/g, (_, assetName) => {
        const cleaned = assetName.replace(/^assets\//, "");
        return (
          assetInlineMap[cleaned] ?? new URL(cleaned, assetBase).href
        );
      })
      .replace(/{{name}}/g, form.name)
      .replace(/{{surname}}/g, form.surname)
      .replace(/{{position}}/g, form.position)
      .replace(/{{phone}}/g, `${countryCodes[form.country]} ${form.phone}`)
      .replace(/{{email}}/g, form.email);
    setSignatureHTML(html);
  };

  const handleDownload = () => {
    const blob = new Blob([signatureHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${form.name}_${form.surname}_signature.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="App">
      <h1>Email Signature Generator</h1>
      <div className="instructions">
        <h2>Instructions:</h2>
        <p>
          1. Complete your data in the form on the left.
          <br />
          2. Click <strong>Generate</strong> to preview your email signature.
          <br />
          3. Click <strong>Download HTML</strong> to save your signature.
          <br />
          4. Open the downloaded file in your browser (Explorer or Chrome).
          <br />
          5. Select the entire signature (<strong>Ctrl + A</strong>).
          <br />
          6. Make sure Outlook Web is open in your browser, then paste signature into the Signature field:  
          <strong> Settings → Accounts → Signature</strong>.
        </p>
      </div>

      {/* Flex container for side-by-side layout */}
      <div className="layout">
        {/* Left column: Data input form */}
        <form onChange={handleChange}>
          <h2>Complete your email signature data:</h2>
          <div className="country-buttons">
            <label>Choose your country:</label>
            <div className="button-group">
              {["Poland", "Czech Republic", "Romania"].map((country) => (
                <button
                  key={country}
                  type="button"
                  className={`country-btn ${
                    form.country === country ? "selected" : ""
                  }`}
                  onClick={() => setForm((prev) => ({ ...prev, country }))}
                >
                  {country}
                </button>
              ))}
            </div>
          </div>

          <input name="name" placeholder="Enter your first name" />
          <input name="surname" placeholder="Enter your last name" />
          <input name="position" placeholder="Enter your job position" />
          <input name="phone" placeholder="Enter your phone" />
          <input name="email" placeholder="Enter your email @rc-cee.com" />
          <select name="templateId">
            <option value="1">
              1. Signature with Popeyes and Burger King logo
            </option>
            <option value="2">2. Signature with Popeyes logo</option>
            <option value="3">3. Signature with Burger King logo</option>
          </select>
          <button type="button" onClick={handleGenerate}>
            Generate
          </button>
        </form>

        {/* Right column: Signature preview (shown after generation) */}
        {signatureHTML && (
          <div className="preview-container">
            <h2>Preview:</h2>
            <div
              className="signature-preview"
              dangerouslySetInnerHTML={{ __html: signatureHTML }}
            ></div>
            <button
              className="button full-width-button"
              onClick={handleDownload}
            >
              Download HTML
            </button>
          </div>
        )}
      </div>
      <footer className="footer">
        <p>
          Co-created by <strong>Miłosz P.</strong> & <strong>Bernadeta O.</strong>
        </p>
      </footer>
    </div>
  );
}

export default App;
