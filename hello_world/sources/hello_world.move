
/// Module: hello_world
module hello_world::hello_world;


use std::string;

/// An object that contains an arbitrary string
public struct HelloWorldObject has key, store {
    id: UID,
    /// A string contained in the object
    text: string::String,
}

#[lint_allow(self_transfer)]
public fun mint(ctx: &mut TxContext) {
    let object = HelloWorldObject {
        id: object::new(ctx),
        text: b"Hello World!".to_string(),
    };
    transfer::public_transfer(object, ctx.sender());
}

// For Move coding conventions, see
// https://docs.sui.io/concepts/sui-move-concepts/conventions


