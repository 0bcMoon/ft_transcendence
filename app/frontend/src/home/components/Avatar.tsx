export default function Avatar({ name, size = 56 }: { name: string; size?: number }) {
    const src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1f2937&color=fff&size=${Math.max(48, size)}`;
    return (
        <img
            src={src}
            alt={name}
            className="rounded-full object-cover shadow"
            style={{ width: size, height: size }}
        />
    );
}
