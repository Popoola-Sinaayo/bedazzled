function toggleByValue(selectEl, expectedValue, targetEl) {
    if (!selectEl || !targetEl) return;
    const handler = () => {
        const shouldShow = selectEl.value === expectedValue;
        targetEl.classList.toggle("hidden", !shouldShow);
        targetEl.querySelectorAll("input, select, textarea").forEach((field) => {
            if (field.dataset.conditionalRequired === "true") {
                field.required = shouldShow;
            }
        });
    };
    selectEl.addEventListener("change", handler);
    handler();
}

const EMAILJS_PUBLIC_KEY = "rfNIxlHzT7yehopFz";
const EMAILJS_SERVICE_ID = "service_c7n9j9u";
const EMAILJS_TEMPLATE_ID = "template_pd0x5al";
const RECIPIENT_EMAIL = "support@babble-translate.com";

function toggleVenueName(typeSelectId, venueWrapId) {
    const typeSelect = document.getElementById(typeSelectId);
    const venueWrap = document.getElementById(venueWrapId);
    if (!typeSelect || !venueWrap) return;

    const venueInput = venueWrap.querySelector("input");
    const onChange = () => {
        const needsVenue = typeSelect.value === "hotel" || typeSelect.value === "restaurant";
        venueWrap.classList.toggle("hidden", !needsVenue);
        if (venueInput) venueInput.required = needsVenue;
    };
    typeSelect.addEventListener("change", onChange);
    onChange();
}

function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
}

function getChecked(id) {
    const el = document.getElementById(id);
    return !!(el && el.checked);
}

function setStatus(message, type = "") {
    const statusEl = document.getElementById("formStatus");
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = "form-status";
    if (type) statusEl.classList.add(type, "show");
}

function setSubmitLoading(isLoading) {
    const submitBtn = document.getElementById("submitEnquiryBtn");
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? "Sending..." : "Submit Enquiry";
}

function buildLocationPayload(index) {
    const type = getValue(`locationType${index}`);
    return {
        postcode: getValue(`location${index}Postcode`),
        address: getValue(`location${index}Address`),
        type: type || "-",
        venue_name: type === "hotel" || type === "restaurant" ? getValue(`location${index}VenueName`) : "-",
        type_other: type === "other" ? getValue(`location${index}TypeOther`) : "-",
        service: getValue(`location${index}Service`) || "-"
    };
}

function buildTemplatePayload() {
    const eventType = getValue("eventType");
    const attachmentsInput = document.getElementById("attachments");
    const attachmentNames = attachmentsInput?.files?.length
        ? Array.from(attachmentsInput.files).map((file) => file.name).join(", ")
        : "None";

    const location1 = buildLocationPayload(1);
    const location2 = buildLocationPayload(2);
    const location3 = buildLocationPayload(3);

    return {
        to_email: RECIPIENT_EMAIL,
        full_name: getValue("fullName"),
        email_address: getValue("emailAddress"),
        phone_number: getValue("phoneNumber"),
        gender: getValue("gender") || "-",
        home_postcode: getValue("homePostcode") || "-",
        home_address: getValue("homeAddress") || "-",
        partner_name: getValue("partnerName") || "-",
        partner_gender: getValue("partnerGender") || "-",
        event_type: eventType || "-",
        milestone: eventType === "anniversary" ? getValue("milestone") || "-" : "-",
        event_other_description: eventType === "other" ? getValue("eventOtherDescription") || "-" : "-",
        event_date: getValue("eventDate") || "-",
        location_1_postcode: location1.postcode || "-",
        location_1_address: location1.address || "-",
        location_1_type: location1.type,
        location_1_venue_name: location1.venue_name,
        location_1_type_other: location1.type_other,
        location_1_service: location1.service,
        location_2_postcode: location2.postcode || "-",
        location_2_address: location2.address || "-",
        location_2_type: location2.type,
        location_2_venue_name: location2.venue_name,
        location_2_type_other: location2.type_other,
        location_2_service: location2.service,
        location_3_postcode: location3.postcode || "-",
        location_3_address: location3.address || "-",
        location_3_type: location3.type,
        location_3_venue_name: location3.venue_name,
        location_3_type_other: location3.type_other,
        location_3_service: location3.service,
        message: getValue("message") || "-",
        special_requests: getValue("specialRequests") || "-",
        budget: getValue("budget") || "-",
        callback_requested: getChecked("callbackRequested") ? "Yes" : "No",
        agreed_privacy: getChecked("agreePrivacy") ? "Yes" : "No",
        agreed_terms: getChecked("agreeTerms") ? "Yes" : "No",
        attachment_names: attachmentNames,
        summary: `${getValue("fullName")} requested ${eventType || "an event"} on ${getValue("eventDate") || "TBD"} with budget ${getValue("budget") || "TBD"}.`
    };
}

async function submitViaEmailJS(formEl) {
    if (typeof emailjs === "undefined") {
        setStatus("Email service is unavailable right now. Please try again shortly.", "error");
        return;
    }

    if (
        EMAILJS_PUBLIC_KEY === "YOUR_EMAILJS_PUBLIC_KEY" ||
        EMAILJS_SERVICE_ID === "YOUR_EMAILJS_SERVICE_ID" ||
        EMAILJS_TEMPLATE_ID === "YOUR_EMAILJS_TEMPLATE_ID"
    ) {
        setStatus("Email integration is not configured yet. Add your EmailJS keys in contact.js.", "error");
        return;
    }

    setSubmitLoading(true);
    setStatus("Sending your enquiry...", "");

    try {
        const payload = buildTemplatePayload();
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, payload);
        setStatus("Your enquiry has been sent successfully. We will contact you soon.", "success");
        formEl.reset();
    } catch (error) {
        setStatus("We could not send your enquiry just now. Please try again.", "error");
    } finally {
        setSubmitLoading(false);
    }
}

function toggleLocationOther(typeSelectId, otherWrapId) {
    const typeSelect = document.getElementById(typeSelectId);
    const otherWrap = document.getElementById(otherWrapId);
    if (!typeSelect || !otherWrap) return;

    const otherInput = otherWrap.querySelector("input");
    const onChange = () => {
        const isOther = typeSelect.value === "other";
        otherWrap.classList.toggle("hidden", !isOther);
        if (otherInput) otherInput.required = isOther;
    };
    typeSelect.addEventListener("change", onChange);
    onChange();
}

document.addEventListener("DOMContentLoaded", () => {
    if (typeof flatpickr !== "undefined") {
        flatpickr("#eventDate", {
            minDate: "today",
            altInput: true,
            altFormat: "F j, Y",
            dateFormat: "Y-m-d",
            disableMobile: true
        });
    }

    if (typeof Choices !== "undefined") {
        document.querySelectorAll("select").forEach((el) => {
            new Choices(el, {
                searchEnabled: false,
                itemSelectText: "",
                shouldSort: false,
                allowHTML: false
            });
        });
    }

    if (typeof emailjs !== "undefined" && EMAILJS_PUBLIC_KEY !== "YOUR_EMAILJS_PUBLIC_KEY") {
        emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    }

    const eventSelect = document.getElementById("eventType");
    const milestoneWrap = document.getElementById("milestoneWrap");
    const eventOtherWrap = document.getElementById("eventOtherWrap");
    toggleByValue(eventSelect, "anniversary", milestoneWrap);
    toggleByValue(eventSelect, "other", eventOtherWrap);

    toggleVenueName("locationType1", "venueNameWrap1");
    toggleVenueName("locationType2", "venueNameWrap2");
    toggleVenueName("locationType3", "venueNameWrap3");

    toggleLocationOther("locationType1", "locationTypeOtherWrap1");
    toggleLocationOther("locationType2", "locationTypeOtherWrap2");
    toggleLocationOther("locationType3", "locationTypeOtherWrap3");

    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            if (!contactForm.checkValidity()) {
                contactForm.reportValidity();
                return;
            }
            await submitViaEmailJS(contactForm);
        });
    }
});
