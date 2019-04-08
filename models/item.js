var Item = new ItemSchema({
    img: { data: Buffer, contentType: String }
});
var Item = mongoose.model('Clothes', ItemSchema);