function mask(event, node) {
    node = node ? node : event.target;
    node.value = node.value.replace(/[^a-z0-9]+/gi, '').replace(/(.{3})/g, '$1 ');
    return true;
}

document.querySelectorAll('[data-input-mask]').forEach(function (node) {
    node.addEventListener('keypress', mask);
    node.addEventListener('change', mask);
    node.addEventListener('blur', mask);
    mask(false, node);
});