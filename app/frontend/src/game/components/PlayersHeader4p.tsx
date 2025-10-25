import React from "react";

type Side4 = "top" | "bottom" | "left" | "right";

type Names4 = Partial<Record<Side4, string>>;
type Avatars4 = Partial<Record<Side4, string>>;

interface Props {
    playerNames: Names4;
    playerAvatars?: Avatars4 | null;
    youSide?: Side4 | null;
}

const Badge: React.FC<{ label: string }> = ({ label }) => (
    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 uppercase tracking-wide">
        {label}
    </span>
);

const Item: React.FC<{
    name?: string;
    avatar?: string;
    highlight?: boolean;
    align?: "center" | "left" | "right";
}> = ({ name, avatar, highlight, align = "center" }) => {
    if (!name) return <div />;
    return (
        <div
            className={`flex items-center ${align === "center" ? "justify-center" : align === "left" ? "justify-start" : "justify-end"} px-3 py-2`}
        >
            {align === "right" ? null : (
                <img
                    src={avatar || "/avatar-placeholder.png"}
                    alt={name}
                    className="w-7 h-7 rounded-full border border-gray-200 object-cover"
                />
            )}
            <div className={`mx-2 text-sm font-medium ${highlight ? "text-purple-700" : "text-gray-800"}`}>
                {name}
                {highlight && <Badge label="You" />}
            </div>
            {align === "right" && (
                <img
                    src={avatar || "/avatar-placeholder.png"}
                    alt={name}
                    className="w-7 h-7 rounded-full border border-gray-200 object-cover"
                />
            )}
        </div>
    );
};

const PlayersHeader4p: React.FC<Props> = ({ playerNames, playerAvatars, youSide }) => {
    return (
        <div className="w-full bg-white border-b border-gray-100">
            <div className="px-4 py-3">
                {/* Top */}
                <div className="flex justify-center">
                    <Item
                        name={playerNames.top}
                        avatar={playerAvatars?.top ?? undefined}
                        highlight={youSide === "top"}
                        align="center"
                    />
                </div>

                {/* Middle: left/right */}
                <div className="flex justify-between items-center mt-1">
                    <Item
                        name={playerNames.left}
                        avatar={playerAvatars?.left ?? undefined}
                        highlight={youSide === "left"}
                        align="left"
                    />
                    <Item
                        name={playerNames.right}
                        avatar={playerAvatars?.right ?? undefined}
                        highlight={youSide === "right"}
                        align="right"
                    />
                </div>

                {/* Bottom */}
                <div className="flex justify-center mt-1">
                    <Item
                        name={playerNames.bottom}
                        avatar={playerAvatars?.bottom ?? undefined}
                        highlight={youSide === "bottom"}
                        align="center"
                    />
                </div>
            </div>
        </div>
    );
};

export default PlayersHeader4p;
