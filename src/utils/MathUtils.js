const parsePitch = (pitch) => {
    return pitch.split('\n')
        .filter((x) => x.length > 5)
        .map((x) => Number(x.split(' ')[1]));
}

const smooth = (seq, N) => {
    N = N || 5;

    let out = [];

    for (let i = 0; i < seq.length; i++) {

        let npitched = 0;
        let v = 0;

        for (let j = 0; j < N; j++) {
            let j1 = Math.max(0, Math.min(j + i, seq.length - 1));
            var v1 = seq[j1];
            if (v1 > 20) {
                v += v1;
                npitched += 1;
            }
            else if (j1 >= i) {
                // Hit gap after idx
                break
            }
            else if (j1 <= i) {
                // Hit gap before/on: reset
                npitched = 0;
                v = 0;
            }
        }
        if (npitched > 1) {
            v /= npitched;
        }

        out.push(v);
    }

    return out;
}

const derivative = (seq) => {
    let out = [];
    for (let i = 0; i < seq.length; i++) {
        let s1 = seq[i];
        let s2 = seq[i + 1];
        if (s1 && s2) {// && s1 > 20 && s2 > 20) {
            out.push(s2 - s1);
        }
        else {
            out.push(0)
        }
    }
    return out;
}

const getDistribution = (seq, name) => {
    name = name || '';

    seq = Object.assign([], seq).sort((x, y) => x > y ? 1 : -1);

    if (seq.length == 0) {
        return {}
    }

    // Ignore outliers
    seq = seq.slice(Math.floor(seq.length * 0.09),
        Math.floor(seq.length * 0.91));

    let out = {};
    out[name + 'mean'] = seq.reduce((acc, x) => acc + x, 0) / seq.length;
    out[name + 'percentile_9'] = seq[0];
    out[name + 'percentile_91'] = seq[seq.length - 1];
    out[name + 'range'] = seq[seq.length - 1] - seq[0];

    return out;
}

const timeStats = (wdlist) => {
    // Analyze gaps
    let gaps = wdlist.filter((x) => x.type == 'gap');

    let gap_distr = getDistribution(gaps.map((x) => x.end - x.start), 'gap_')

    let pgap = gaps.length / wdlist.length;

    // ...and durations
    let phones = wdlist.filter((x) => x.phones)
        .reduce((acc, x) => acc.concat(x.phones.map((p) => p.duration)), []);
    let phone_distr = getDistribution(phones, 'phone_');

    return Object.assign({ pgap }, gap_distr, phone_distr);
}

const pitchStats = (seq) => {

    let smoothed = smooth(seq);

    let velocity = derivative(smoothed);
    let acceleration = derivative(velocity);

    let pitched = seq.filter((p) => p > 20);
    if (pitched.length == 0) {
        return
    }

    let pitch_distr = getDistribution(pitched, 'pitch_');

    let acceled = acceleration.filter((p) => Math.abs(p) > 0.1);
    let accel_distr = getDistribution(acceled, 'accel_');
    accel_distr['accel_norm'] = acceled.reduce((acc, x) => acc + Math.abs(x), 0) / acceled.length; // XXX: percentiles...

    return Object.assign({
        smoothed,
        velocity,
        acceleration
    },
        pitch_distr, accel_distr);
}

const durationFromPitch = pitch => pitch.length / 100;

export {
    parsePitch,
    smooth,
    derivative,
    getDistribution,
    timeStats,
    pitchStats,
    durationFromPitch,
};