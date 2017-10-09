export default function fluctuation() {
    return ($scope, $el, $attr) => {
        var value = +$attr['fluctuation'];
        var klass = null;
        if (value > 0) {
            klass = 'fluctuation-up'
        } if (value < 0) {
            klass = 'fluctuation-down'
        }
        if (klass) {
            $el.addClass(klass);
        }
    };
}


