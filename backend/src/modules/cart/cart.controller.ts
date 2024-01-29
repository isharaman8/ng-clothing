// third party imports
import { Body, Controller, Get, InternalServerErrorException, Post, Req, Res } from '@nestjs/common';

// inner imports
import { CartService } from './cart.service';
import { CreateOrUpdateCartDto } from 'src/dto';
import { CRequest, CResponse } from 'src/interfaces';

@Controller('cart')
export class CartController {
  constructor(private cartSerivce: CartService) {}

  @Get()
  async getUserCart(@Req() request: CRequest) {
    let cart: any = { products: [] };

    try {
      cart = await this.cartSerivce.getUserCart(request.user);
      cart = await this.cartSerivce.getUpatedCartImageUrls(cart);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return { cart: this.cartSerivce.getParsedCartResponsePayload(cart) };
  }

  @Post('create-or-update')
  async createOrUpdateUserCart(
    @Body('cart') _cart: CreateOrUpdateCartDto,
    @Req() request: CRequest,
    @Res() response: CResponse,
  ) {
    const { oldCart, cart: payload } = response.locals;

    let createdOrUpdatedCart: any = { products: [] };

    try {
      createdOrUpdatedCart = await this.cartSerivce.createOrUpdateUserCart(payload, oldCart, request.user);
      createdOrUpdatedCart = await this.cartSerivce.getUpatedCartImageUrls(createdOrUpdatedCart);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return response.status(200).send({ cart: this.cartSerivce.getParsedCartResponsePayload(createdOrUpdatedCart) });
  }
}
